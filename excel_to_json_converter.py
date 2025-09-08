#!/usr/bin/env python3
"""
Script para convertir Excel con datos de asientos a JSON
Formato compatible con la aplicación de planos de asientos
"""

import pandas as pd
import json
import uuid
from datetime import datetime
import argparse
import os

def generate_shape_id():
    """Genera un ID único para cada shape"""
    timestamp = int(datetime.now().timestamp() * 1000)
    unique_id = str(uuid.uuid4()).replace('-', '')[:8]
    return f"shape_{timestamp}_{unique_id}"

def create_seat_shape(row, seat_index, config):
    """Crea un objeto seat shape basado en los datos del Excel"""
    
    # Calcular posición X basada en la columna del asiento
    base_x = config.get('base_x', 100)
    seat_spacing = config.get('seat_spacing', 25)
    seat_width = config.get('seat_width', 20)
    
    # Calcular posición Y basada en la fila
    base_y = config.get('base_y', 40)
    row_spacing = config.get('row_spacing', 20)
    seat_height = config.get('seat_height', 20)
    
    # Extraer datos del Excel
    row_letter = str(row.get('Fila', 'A')).strip()
    seat_number = str(row.get('Asiento', seat_index + 1)).strip()
    section = str(row.get('Seccion', 'General')).strip()
    price = float(row.get('Precio', 50))
    
    # Calcular posiciones
    x = base_x + (seat_index * seat_spacing)
    y = base_y + (ord(row_letter.upper()) - ord('A')) * row_spacing
    
    # Crear el objeto seat
    seat_shape = {
        "id": generate_shape_id(),
        "type": "seat",
        "x": x,
        "y": y,
        "width": seat_width,
        "height": seat_height,
        "fill": "#3B82F6",
        "stroke": "#1E40AF",
        "strokeWidth": 2,
        "rotation": 0,
        "draggable": True,
        "selected": False,
        "seatStatus": "available",
        "seatNumber": f"{row_letter}{seat_number}",
        "seatSection": section,
        "seatPrice": price
    }
    
    return seat_shape

def create_section_label(section_name, x, y, config):
    """Crea una etiqueta de texto para la sección"""
    
    label_shape = {
        "id": generate_shape_id(),
        "type": "text",
        "x": x,
        "y": y,
        "width": len(section_name) * 8,
        "height": 20,
        "fill": "#ffffff",
        "stroke": "#ffffff",
        "strokeWidth": 2,
        "rotation": 0,
        "draggable": True,
        "selected": False,
        "text": section_name,
        "fontSize": 14,
        "fontFamily": "Arial"
    }
    
    return label_shape

def create_section_rectangle(section_name, x, y, width, height, config):
    """Crea un rectángulo de fondo para la sección"""
    
    rect_shape = {
        "id": generate_shape_id(),
        "type": "rectangle",
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        "fill": "#3B82F6",
        "stroke": "#1E40AF",
        "strokeWidth": 2,
        "rotation": 0,
        "draggable": True,
        "selected": False
    }
    
    return rect_shape

def excel_to_json(excel_file, output_file, config=None):
    """
    Convierte un archivo Excel a JSON
    
    Args:
        excel_file (str): Ruta al archivo Excel
        output_file (str): Ruta del archivo JSON de salida
        config (dict): Configuración opcional para posicionamiento
    """
    
    # Configuración por defecto
    default_config = {
        'base_x': 100,
        'base_y': 40,
        'seat_spacing': 25,
        'row_spacing': 20,
        'seat_width': 20,
        'seat_height': 20,
        'create_section_labels': True,
        'create_section_rectangles': True
    }
    
    if config:
        default_config.update(config)
    
    config = default_config
    
    try:
        # Leer el Excel
        print(f"📖 Leyendo archivo Excel: {excel_file}")
        df = pd.read_excel(excel_file, sheet_name=0)
        
        print(f"📊 Columnas encontradas: {list(df.columns)}")
        print(f"📊 Filas encontradas: {len(df)}")
        
        # Limpiar datos
        df = df.dropna(subset=['Fila', 'Asiento'])  # Eliminar filas sin datos esenciales
        
        # Inicializar lista de shapes
        shapes = []
        
        # Agrupar por sección
        sections = df.groupby('Seccion') if 'Seccion' in df.columns else [('General', df)]
        
        current_y_offset = config['base_y']
        
        for section_name, section_df in sections:
            print(f"🎭 Procesando sección: {section_name}")
            
            # Crear rectángulo de sección si está habilitado
            if config['create_section_rectangles']:
                section_width = len(section_df) * config['seat_spacing'] + 50
                section_height = 30
                section_rect = create_section_rectangle(
                    section_name, 
                    config['base_x'] - 20, 
                    current_y_offset - 10, 
                    section_width, 
                    section_height, 
                    config
                )
                shapes.append(section_rect)
            
            # Crear etiqueta de sección si está habilitado
            if config['create_section_labels']:
                section_label = create_section_label(
                    section_name,
                    config['base_x'],
                    current_y_offset,
                    config
                )
                shapes.append(section_label)
            
            # Crear asientos para esta sección
            for index, row in section_df.iterrows():
                seat_shape = create_seat_shape(row, index, config)
                shapes.append(seat_shape)
            
            # Actualizar offset para la siguiente sección
            max_row = section_df['Fila'].max() if 'Fila' in section_df.columns else 'A'
            current_y_offset += (ord(str(max_row).upper()) - ord('A') + 1) * config['row_spacing'] + 50
        
        # Crear el objeto JSON final
        json_data = {
            "shapes": shapes,
            "gridConfig": {
                "enabled": True,
                "size": 40,
                "color": "#E5E7EB",
                "opacity": 0.5,
                "snapToGrid": False,
                "seatSize": 1
            }
        }
        
        # Guardar el JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ JSON generado exitosamente: {output_file}")
        print(f"📊 Total de shapes creados: {len(shapes)}")
        print(f"💺 Total de asientos: {len([s for s in shapes if s['type'] == 'seat'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Convierte Excel a JSON para planos de asientos')
    parser.add_argument('excel_file', help='Ruta al archivo Excel')
    parser.add_argument('-o', '--output', help='Archivo JSON de salida (opcional)')
    parser.add_argument('--base-x', type=int, default=100, help='Posición X base')
    parser.add_argument('--base-y', type=int, default=40, help='Posición Y base')
    parser.add_argument('--seat-spacing', type=int, default=25, help='Espaciado entre asientos')
    parser.add_argument('--row-spacing', type=int, default=20, help='Espaciado entre filas')
    parser.add_argument('--seat-width', type=int, default=20, help='Ancho del asiento')
    parser.add_argument('--seat-height', type=int, default=20, help='Alto del asiento')
    
    args = parser.parse_args()
    
    # Verificar que el archivo Excel existe
    if not os.path.exists(args.excel_file):
        print(f"❌ Error: El archivo {args.excel_file} no existe")
        return
    
    # Generar nombre de archivo de salida si no se especifica
    if not args.output:
        base_name = os.path.splitext(args.excel_file)[0]
        args.output = f"{base_name}_converted.json"
    
    # Configuración
    config = {
        'base_x': args.base_x,
        'base_y': args.base_y,
        'seat_spacing': args.seat_spacing,
        'row_spacing': args.row_spacing,
        'seat_width': args.seat_width,
        'seat_height': args.seat_height
    }
    
    # Convertir
    success = excel_to_json(args.excel_file, args.output, config)
    
    if success:
        print(f"\n🎉 Conversión completada!")
        print(f"📁 Archivo generado: {args.output}")
        print(f"💡 Puedes cargar este archivo en tu aplicación de planos")

if __name__ == "__main__":
    main()


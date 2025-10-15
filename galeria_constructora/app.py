from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
import os
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max

# -------- Funciones auxiliares --------

def cargar_proyectos():
    if os.path.exists('proyectos.json'):
        with open('proyectos.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def guardar_proyectos(data):
    with open('proyectos.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {
        'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'webm', 'avi'
    }

def es_video(filename):
    return filename.split('.')[-1].lower() in {'mp4', 'mov', 'webm', 'avi'}

def obtener_imagen_portada(proyecto):
    """Obtiene la primera imagen/video como portada"""
    if proyecto.get('media') and len(proyecto['media']) > 0:
        return proyecto['media'][0]['url']
    return "https://via.placeholder.com/400x300?text=Sin+Imagen"

# -------- Rutas principales --------

@app.route('/')
def home():
    proyectos = cargar_proyectos()
    # Agregar imagen de portada a cada proyecto
    for proyecto in proyectos:
        proyecto['portada'] = obtener_imagen_portada(proyecto)
        proyecto['total_media'] = len(proyecto.get('media', []))
    return render_template('index.html', proyectos=proyectos, titulo="Todos los Proyectos")

@app.route('/imagenes')
def solo_imagenes():
    proyectos = cargar_proyectos()
    # Filtrar proyectos que tengan al menos una imagen
    proyectos_filtrados = []
    for p in proyectos:
        tiene_imagen = any(not es_video(m['url']) for m in p.get('media', []))
        if tiene_imagen:
            p['portada'] = obtener_imagen_portada(p)
            p['total_media'] = len(p.get('media', []))
            proyectos_filtrados.append(p)
    return render_template('index.html', proyectos=proyectos_filtrados, titulo="Proyectos con Imágenes")

@app.route('/videos')
def solo_videos():
    proyectos = cargar_proyectos()
    # Filtrar proyectos que tengan al menos un video
    proyectos_filtrados = []
    for p in proyectos:
        tiene_video = any(es_video(m['url']) for m in p.get('media', []))
        if tiene_video:
            p['portada'] = obtener_imagen_portada(p)
            p['total_media'] = len(p.get('media', []))
            proyectos_filtrados.append(p)
    return render_template('index.html', proyectos=proyectos_filtrados, titulo="Proyectos con Videos")

@app.route('/recientes')
def recientes():
    proyectos = cargar_proyectos()
    proyectos.sort(key=lambda p: p.get('fecha_agregado', ''), reverse=True)
    for proyecto in proyectos:
        proyecto['portada'] = obtener_imagen_portada(proyecto)
        proyecto['total_media'] = len(proyecto.get('media', []))
    return render_template('index.html', proyectos=proyectos, titulo="Proyectos Recientes")

# -------- Detalle del proyecto --------

@app.route('/proyecto/<int:proyecto_id>')
def ver_proyecto(proyecto_id):
    """Muestra los detalles de un proyecto con toda su galería"""
    proyectos = cargar_proyectos()
    proyecto = next((p for p in proyectos if p["id"] == proyecto_id), None)
    if not proyecto:
        return "Proyecto no encontrado", 404

    # Contador de vistas
    proyecto["vistas"] = proyecto.get("vistas", 0) + 1
    guardar_proyectos(proyectos)

    # Separar imágenes y videos
    imagenes = [m for m in proyecto.get('media', []) if not es_video(m['url'])]
    videos = [m for m in proyecto.get('media', []) if es_video(m['url'])]

    return render_template('detalle.html', 
                         proyecto=proyecto, 
                         imagenes=imagenes, 
                         videos=videos)

# -------- CRUD --------

@app.route('/agregar', methods=['GET', 'POST'])
def agregar():
    if request.method == 'POST':
        proyectos = cargar_proyectos()
        
        nombre = request.form['nombre']
        descripcion = request.form['descripcion']
        ubicacion = request.form.get('ubicacion', '')
        cliente = request.form.get('cliente', '')
        
        # Crear carpeta de uploads si no existe
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Procesar archivos múltiples
        media_list = []
        archivos = request.files.getlist('archivos')
        
        for archivo in archivos:
            if archivo and allowed_file(archivo.filename):
                filename = secure_filename(archivo.filename)
                # Agregar timestamp para evitar duplicados
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{timestamp}_{filename}"
                upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                archivo.save(upload_path)
                
                media_list.append({
                    'url': f"/static/uploads/{filename}",
                    'tipo': 'video' if es_video(filename) else 'imagen',
                    'nombre': archivo.filename,
                    'fecha_subida': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
        
        # Si no hay archivos, agregar placeholder
        if not media_list:
            media_list.append({
                'url': "https://via.placeholder.com/400x300?text=Sin+Imagen",
                'tipo': 'imagen',
                'nombre': 'placeholder.jpg',
                'fecha_subida': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })
        
        nuevo_proyecto = {
            "id": max([p.get("id", 0) for p in proyectos], default=0) + 1,
            "nombre": nombre,
            "descripcion": descripcion,
            "ubicacion": ubicacion,
            "cliente": cliente,
            "media": media_list,
            "fecha_agregado": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "vistas": 0
        }

        proyectos.append(nuevo_proyecto)
        guardar_proyectos(proyectos)
        return redirect(url_for('home'))

    return render_template('agregar.html')

@app.route('/editar/<int:id>', methods=['GET', 'POST'])
def editar(id):
    proyectos = cargar_proyectos()
    proyecto = next((p for p in proyectos if p['id'] == id), None)
    if not proyecto:
        return redirect(url_for('home'))

    if request.method == 'POST':
        proyecto['nombre'] = request.form['nombre']
        proyecto['descripcion'] = request.form['descripcion']
        proyecto['ubicacion'] = request.form.get('ubicacion', '')
        proyecto['cliente'] = request.form.get('cliente', '')
        
        # Procesar nuevos archivos
        archivos = request.files.getlist('archivos')
        for archivo in archivos:
            if archivo and allowed_file(archivo.filename):
                filename = secure_filename(archivo.filename)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"{timestamp}_{filename}"
                upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                archivo.save(upload_path)
                
                proyecto['media'].append({
                    'url': f"/static/uploads/{filename}",
                    'tipo': 'video' if es_video(filename) else 'imagen',
                    'nombre': archivo.filename,
                    'fecha_subida': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
        
        guardar_proyectos(proyectos)
        return redirect(url_for('ver_proyecto', proyecto_id=id))

    return render_template('editar.html', proyecto=proyecto)

@app.route('/eliminar/<int:id>', methods=['POST'])
def eliminar(id):
    proyectos = cargar_proyectos()
    proyectos = [p for p in proyectos if p['id'] != id]
    guardar_proyectos(proyectos)
    return redirect(url_for('home'))

@app.route('/eliminar-media/<int:proyecto_id>/<int:media_index>', methods=['POST'])
def eliminar_media(proyecto_id, media_index):
    """Eliminar un archivo específico de un proyecto"""
    proyectos = cargar_proyectos()
    proyecto = next((p for p in proyectos if p['id'] == proyecto_id), None)
    
    if proyecto and 0 <= media_index < len(proyecto['media']):
        # Eliminar archivo del sistema si es local
        media_url = proyecto['media'][media_index]['url']
        if media_url.startswith('/static/uploads/'):
            try:
                filepath = media_url[1:]  # Remover el '/' inicial
                if os.path.exists(filepath):
                    os.remove(filepath)
            except:
                pass
        
        # Eliminar de la lista
        proyecto['media'].pop(media_index)
        guardar_proyectos(proyectos)
    
    return redirect(url_for('editar', id=proyecto_id))

# -------- Ejecutar servidor --------

if __name__ == '__main__':
    app.run(debug=True)
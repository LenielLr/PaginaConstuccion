from flask import Flask, render_template, request, redirect, url_for
import json
import os
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'

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
        'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'webm'
    }

def es_video(filename):
    return filename.split('.')[-1].lower() in {'mp4', 'mov', 'webm'}

# -------- Rutas principales --------

@app.route('/')
def home():
    proyectos = cargar_proyectos()
    return render_template('index.html', proyectos=proyectos, titulo="Galería completa")

@app.route('/imagenes')
def solo_imagenes():
    proyectos = cargar_proyectos()
    imagenes = [p for p in proyectos if not es_video(p['imagen'])]
    return render_template('index.html', proyectos=imagenes, titulo="Solo imágenes")

@app.route('/videos')
def solo_videos():
    proyectos = cargar_proyectos()
    videos = [p for p in proyectos if es_video(p['imagen'])]
    return render_template('index.html', proyectos=videos, titulo="Solo videos")

@app.route('/recientes')
def recientes():
    proyectos = cargar_proyectos()
    proyectos.sort(key=lambda p: p.get('fecha_agregado', ''), reverse=True)
    return render_template('index.html', proyectos=proyectos, titulo="Recientes")

# -------- Detalle individual (Etapa 9) --------

@app.route('/proyecto/<int:proyecto_id>')
def ver_proyecto(proyecto_id):
    """Muestra los detalles de un proyecto individual"""
    proyectos = cargar_proyectos()
    proyecto = next((p for p in proyectos if p["id"] == proyecto_id), None)
    if not proyecto:
        return "Proyecto no encontrado", 404

    # Contador de vistas
    proyecto["vistas"] = proyecto.get("vistas", 0) + 1
    guardar_proyectos(proyectos)

    return render_template('detalle.html', proyecto=proyecto)

# -------- CRUD --------

@app.route('/agregar', methods=['GET', 'POST'])
def agregar():
    proyectos = cargar_proyectos()
    if request.method == 'POST':
        nombre = request.form['nombre']
        descripcion = request.form['descripcion']
        imagen_url = request.form.get('imagen_url')
        imagen_file = request.files.get('imagen_file')

        if imagen_file and allowed_file(imagen_file.filename):
            filename = secure_filename(imagen_file.filename)
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            imagen_file.save(upload_path)
            imagen_path = f"/static/uploads/{filename}"  # ✅ Correcto
        elif imagen_url:
            imagen_path = imagen_url
        else:
            imagen_path = "https://via.placeholder.com/300x200?text=Sin+imagen"

        nuevo_proyecto = {
            "id": max([p.get("id", 0) for p in proyectos], default=0) + 1,
            "nombre": nombre,
            "descripcion": descripcion,
            "imagen": imagen_path,
            "fecha_agregado": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "vistas": 0,
            "media": []  # Lista para futuras imágenes/videos relacionados
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
        guardar_proyectos(proyectos)
        return redirect(url_for('home'))

    return render_template('editar.html', proyecto=proyecto)

@app.route('/eliminar/<int:id>', methods=['POST'])
def eliminar(id):
    proyectos = cargar_proyectos()
    proyectos = [p for p in proyectos if p['id'] != id]
    guardar_proyectos(proyectos)
    return redirect(url_for('home'))

# -------- Ejecutar servidor --------

if __name__ == '__main__':
    app.run(debug=True)

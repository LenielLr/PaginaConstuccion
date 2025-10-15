from flask import Flask, render_template, request, redirect, url_for, jsonify, session
import json
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from functools import wraps

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200MB
app.secret_key = 'tu-clave-secreta-super-segura-2025'  # CAMBIAR EN PRODUCCIÓN

# Credenciales admin (en producción usar base de datos con contraseñas hasheadas)
ADMIN_USER = 'admin'
ADMIN_PASSWORD = 'constructora2025'  # CAMBIAR ESTO

# -------- Decorador para proteger rutas --------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

# -------- Funciones auxiliares --------
def cargar_proyectos():
    if os.path.exists('proyectos.json'):
        with open('proyectos.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def guardar_proyectos(data):
    try:
        print(f"[GUARDAR] Intentando guardar {len(data)} proyectos...")
        with open('proyectos.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"[GUARDAR] ✓ Guardado exitoso")
    except Exception as e:
        print(f"[GUARDAR] ✗ Error: {e}")
        raise

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {
        'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'webm', 'avi'
    }

def es_video(filename):
    return filename.split('.')[-1].lower() in {'mp4', 'mov', 'webm', 'avi'}

def obtener_imagen_portada(proyecto):
    if proyecto.get('media') and len(proyecto['media']) > 0:
        return proyecto['media'][0]['url']
    return "https://via.placeholder.com/400x300?text=Sin+Imagen"

# -------- Autenticación --------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == ADMIN_USER and password == ADMIN_PASSWORD:
            session['logged_in'] = True
            session['username'] = username
            next_page = request.args.get('next')
            return redirect(next_page or url_for('home'))
        else:
            return render_template('login.html', error='Credenciales incorrectas')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

# -------- Rutas públicas --------
@app.route('/')
def home():
    proyectos = cargar_proyectos()
    for proyecto in proyectos:
        proyecto['portada'] = obtener_imagen_portada(proyecto)
        proyecto['total_media'] = len(proyecto.get('media', []))
    return render_template('index.html', proyectos=proyectos, titulo="Todos los Proyectos")

@app.route('/imagenes')
def solo_imagenes():
    proyectos = cargar_proyectos()
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

@app.route('/proyecto/<int:proyecto_id>')
def ver_proyecto(proyecto_id):
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

# -------- Rutas protegidas (solo admin) --------
@app.route('/agregar', methods=['GET', 'POST'])
@login_required
def agregar():
    if request.method == 'POST':
        proyectos = cargar_proyectos()
        
        nombre = request.form.get('nombre', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        ubicacion = request.form.get('ubicacion', '').strip()
        cliente = request.form.get('cliente', '').strip()
        
        # Validaciones básicas
        if not nombre or len(nombre) < 3:
            return "Error: El nombre debe tener al menos 3 caracteres", 400
        if not descripcion or len(descripcion) < 10:
            return "Error: La descripción debe tener al menos 10 caracteres", 400
        
        # Crear carpeta de uploads si no existe
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        media_list = []
        archivos = request.files.getlist('archivos')
        
        for archivo in archivos:
            if archivo and archivo.filename and allowed_file(archivo.filename):
                filename = secure_filename(archivo.filename)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                filename = f"{timestamp}_{filename}"
                upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                
                try:
                    archivo.save(upload_path)
                    media_list.append({
                        'url': f"/static/uploads/{filename}",
                        'tipo': 'video' if es_video(filename) else 'imagen',
                        'nombre': archivo.filename,
                        'fecha_subida': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    })
                except Exception as e:
                    print(f"Error al guardar archivo {archivo.filename}: {e}")
        
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
@login_required
def editar(id):
    print(f"\n{'='*50}")
    print(f"EDITAR - Método: {request.method}, ID: {id}")
    print(f"{'='*50}")
    
    try:
        proyectos = cargar_proyectos()
        print(f"✓ Proyectos cargados: {len(proyectos)}")
        
        proyecto = next((p for p in proyectos if p['id'] == id), None)
        
        if not proyecto:
            print(f"✗ Proyecto {id} no encontrado")
            return redirect(url_for('home'))
        
        print(f"✓ Proyecto encontrado: {proyecto.get('nombre', 'Sin nombre')}")

        if request.method == 'POST':
            print("\n--- PROCESANDO POST ---")
            print(f"Form data: {dict(request.form)}")
            print(f"Files: {request.files.getlist('archivos')}")
            
            # Actualizar información básica
            proyecto['nombre'] = request.form.get('nombre', '').strip()
            proyecto['descripcion'] = request.form.get('descripcion', '').strip()
            proyecto['ubicacion'] = request.form.get('ubicacion', '').strip()
            proyecto['cliente'] = request.form.get('cliente', '').strip()
            
            print(f"✓ Datos actualizados:")
            print(f"  - Nombre: {proyecto['nombre']}")
            print(f"  - Descripción: {proyecto['descripcion'][:50]}...")
            
            # Asegurar que existe la lista de media
            if 'media' not in proyecto:
                proyecto['media'] = []
                print("✓ Lista de media inicializada")
            
            # Crear carpeta de uploads si no existe
            try:
                os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
                print(f"✓ Carpeta uploads verificada: {app.config['UPLOAD_FOLDER']}")
            except Exception as e:
                print(f"✗ Error creando carpeta: {e}")
            
            # Procesar nuevos archivos
            archivos = request.files.getlist('archivos')
            print(f"\n--- PROCESANDO ARCHIVOS ({len(archivos)}) ---")
            
            archivos_guardados = 0
            for i, archivo in enumerate(archivos):
                print(f"\nArchivo {i+1}/{len(archivos)}:")
                print(f"  - Nombre: {archivo.filename if archivo else 'None'}")
                
                if archivo and archivo.filename and allowed_file(archivo.filename):
                    filename = secure_filename(archivo.filename)
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                    filename = f"{timestamp}_{filename}"
                    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    
                    try:
                        archivo.save(upload_path)
                        print(f"  ✓ Guardado en: {upload_path}")
                        
                        proyecto['media'].append({
                            'url': f"/static/uploads/{filename}",
                            'tipo': 'video' if es_video(filename) else 'imagen',
                            'nombre': archivo.filename,
                            'fecha_subida': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        })
                        archivos_guardados += 1
                        print(f"  ✓ Agregado a media list")
                    except Exception as e:
                        print(f"  ✗ Error al guardar archivo: {e}")
                        import traceback
                        traceback.print_exc()
                else:
                    print(f"  - Omitido (no válido o vacío)")
            
            print(f"\n✓ Archivos procesados exitosamente: {archivos_guardados}/{len(archivos)}")
            
            # Guardar cambios
            print("\n--- GUARDANDO PROYECTOS ---")
            try:
                guardar_proyectos(proyectos)
                print("✓ proyectos.json guardado exitosamente")
            except Exception as e:
                print(f"✗ ERROR al guardar proyectos.json: {e}")
                import traceback
                traceback.print_exc()
                return f"Error al guardar: {str(e)}", 500
            
            print(f"\n✓ REDIRECCIÓN a ver_proyecto({id})")
            print(f"{'='*50}\n")
            return redirect(url_for('ver_proyecto', proyecto_id=id))
        
        # GET request
        print(f"✓ Renderizando template editar.html")
        print(f"{'='*50}\n")
        return render_template('editar.html', proyecto=proyecto)
        
    except Exception as e:
        print(f"\n✗✗✗ ERROR CRÍTICO ✗✗✗")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        print(f"{'='*50}\n")
        return f"Error crítico: {str(e)}", 500

@app.route('/eliminar/<int:id>', methods=['POST'])
@login_required
def eliminar(id):
    proyectos = cargar_proyectos()
    proyectos = [p for p in proyectos if p['id'] != id]
    guardar_proyectos(proyectos)
    return redirect(url_for('home'))

@app.route('/eliminar-media/<int:proyecto_id>/<int:media_index>', methods=['POST'])
@login_required
def eliminar_media(proyecto_id, media_index):
    proyectos = cargar_proyectos()
    proyecto = next((p for p in proyectos if p['id'] == proyecto_id), None)
    
    if proyecto and 0 <= media_index < len(proyecto['media']):
        media_url = proyecto['media'][media_index]['url']
        if media_url.startswith('/static/uploads/'):
            try:
                filepath = media_url[1:]
                if os.path.exists(filepath):
                    os.remove(filepath)
            except:
                pass
        
        proyecto['media'].pop(media_index)
        guardar_proyectos(proyectos)
    
    return redirect(url_for('editar', id=proyecto_id))

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
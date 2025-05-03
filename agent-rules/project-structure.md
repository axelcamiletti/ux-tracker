# Estructura del Proyecto UX Tracker

Este documento detalla la estructura completa del proyecto Angular, describiendo qué contiene cada carpeta y las funcionalidades implementadas en cada componente.

## Directrices de Actualización de Documentación

> **REGLA CRÍTICA**: Cada vez que se realice un cambio en la estructura del proyecto (añadir/modificar/eliminar componentes, servicios, modelos o cualquier otro archivo), **ES OBLIGATORIO** actualizar este documento para reflejar dichos cambios.

### Proceso de actualización:

1. **Inmediatamente después** de implementar un cambio estructural, actualiza este documento.
2. **Describe con detalle** la funcionalidad y propósito de cada nuevo elemento.
3. **Documenta las relaciones** entre los nuevos elementos y los existentes.
4. **Mantén consistente** el formato de la documentación con el resto del documento.
5. **Incluye comentarios** sobre patrones de uso recomendados para cualquier nueva implementación.

**Nota**: La falta de actualización de este documento se considerará una tarea incompleta y podría generar deuda técnica o dificultar el trabajo del resto del equipo.



## Estructura General

```
src/
  app/                     # Contiene todos los componentes, servicios y lógica de la aplicación
    components/            # Componentes globales de la aplicación
    features/              # Módulos de funcionalidad principales organizados por dominio
      home/                # Página de inicio y dashboard
      projects/            # Gestión de proyectos
        dialogs/           # Dialogs específicos de proyectos
        models/            # Modelos de datos de proyectos
        pages/             # Páginas relacionadas con proyectos
        services/          # Servicios específicos para proyectos
      study/               # Gestión de estudios UX
        components/        # Componentes específicos de estudios
        dialogs/           # Dialogs específicos de estudios
        models/            # Modelos de datos de estudios
        pages/             # Páginas relacionadas con estudios
        services/          # Servicios específicos para estudios
    pipes/                 # Pipes globales personalizados para transformación de datos
    services/              # Servicios globales compartidos
  assets/                  # Recursos estáticos (imágenes, SVGs, etc.)
  environments/            # Configuraciones de entorno (dev, prod)
```

================================================================
## Componentes globales
================================================================

### app/components/

#### main-sidebar
- Navegación principal de la aplicación
- Muestra enlaces a las secciones principales (Home, Projects)
- Muestra logo de la aplicación

#### main-toolbar
- Menú de usuario y configuración (no lo incluye por el momento)

### app/pipes/

#### firebase-date
- Formatea fechas de Firebase para mostrarlas correctamente
- Maneja zonas horarias

#### safe-url
- Sanitiza URLs para uso seguro en la aplicación
- Previene ataques XSS

================================================================
## Módulos de Funcionalidad (Features)
================================================================

### app/features/home/
- Por el momento vacia, no tiene nada. En un futuro se agregara un Dashboard

-----------------------------------------------------------
### app/features/projects/
-----------------------------------------------------------

#### Modelos (models/)
- **project.model.ts**: Define la estructura de datos de los proyectos con propiedades como id, nombre, imagen, fecha de creación y lista de estudios

#### Servicios (services/)
- **project.service.ts**:
  - CRUD completo para proyectos
  - Subida y gestión de imágenes de proyectos
  - Manejo de relaciones entre proyectos y estudios

#### Páginas (pages/)

##### projects-page (pages/projects-page)
- **projects-page.component.html**:
  - Title H1
  - Botón para crear Nuevo proyecto
  - Lista de proyectos con tarjetas visuales
  - Vista vacía cuando no hay proyectos

- **projects-page.component.ts**:
  - Crear nuevo proyecto
  - Editar proyecto (nombre e imagen)
  - Eliminar proyecto
  - Navegar a detalles de proyecto
  - Mostrar vista vacía cuando no hay proyectos
  - Indicador de carga durante operaciones

##### project-page (pages/project-page)
- **project-page.component.html**:
  - Botón de back hacia /projects
  - Botón para crear nuevo estudio
  - Tabla detallada de un proyecto específico que muestra todos los estudios

- **project-page.component.ts**:
  - Cargar proyecto y estudios asociados
  - Crear nuevo estudio
  - Editar nombre del estudio
  - Eliminar estudio
  - Navegación inteligente a estudios según su estado
  - Gestión de estados de estudios (borrador, publicado, completado)

#### Dialogs (dialogs/)

##### new-project-dialog
- **new-project-dialog.component.html**:
  - Título "Crear nuevo proyecto"
  - Formulario con campos para nombre del proyecto
  - Input para subir imagen
  - Botones de cancelar y guardar

- **new-project-dialog.component.ts**:
  - Validación de datos del formulario
  - Manejo de subida de imagen (preview)
  - Emisión de eventos para crear el proyecto
  - Control de estados de carga

##### edit-project-dialog
- **edit-project-dialog.component.html**:
  - Título "Editar proyecto"
  - Formulario con nombre del proyecto precargado
  - Preview de imagen actual (si existe)
  - Opción para cambiar o eliminar la imagen
  - Botones de cancelar y guardar

- **edit-project-dialog.component.ts**:
  - Recibe datos del proyecto a editar
  - Validación del formulario
  - Manejo de cambio de imagen
  - Manejo de eliminación de imagen
  - Emisión de eventos para actualizar el proyecto

##### edit-study-name-dialog
- **edit-study-name-dialog.component.ts** (template inline):
  - Título "Editar nombre del estudio"
  - Campo de formulario para el nombre con etiqueta
  - Botones de cancelar y guardar
  - Diseño responsive con ancho máximo

- **edit-study-name-dialog.component.ts** (lógica):
  - Recepción del nombre actual del estudio vía MAT_DIALOG_DATA
  - Binding bidireccional con ngModel para el nombre
  - Método para guardar cambios y cerrar el dialog
  - Método para cancelar y cerrar sin guardar
  - Estilo encapsulado en el componente

##### share-study-dialog
- **share-study-dialog.component.html**:
  - Cabecera con imagen y título explicativo
  - Campo de texto con URL del estudio solo lectura
  - Botón para copiar enlace al portapapeles
  - Botón para cerrar el dialog
  - Sección de "Opciones de estudio" con toggle
  - Pie con botón para guardar y cerrar

- **share-study-dialog.component.ts**:
  - Recepción de URL y ID del estudio vía MAT_DIALOG_DATA
  - FormControl para la opción de permitir múltiples respuestas
  - Método para copiar URL al portapapeles
  - Notificación de éxito al copiar con snackBar
  - Método para guardar configuración en el estudio
  - Actualización de configuraciones mediante studyService

-----------------------------------------------------------
### app/features/study/
-----------------------------------------------------------

#### Modelos (models/)

##### participant.model.ts: Define la estructura para los participantes de un estudio.
  - **Participant**:
    - `id`: Identificador único del participante
    - `studyId`: ID del estudio al que está asociado
    - `email`: Email opcional del participante
    - `deviceInfo`: Información del dispositivo (browser, OS, screenSize)
    - `startedAt`, `completedAt`, `lastInteractionAt`: Timestamps para seguimiento temporal
    - `status`: Estado del participante ('active', 'completed', 'abandoned')
    - `progress`: Información de avance (secciones completadas, posición actual)
    - `metadata`: Datos adicionales como ubicación, referente, campos personalizados

##### section.model.ts: Define los diferentes tipos de secciones que puede tener un estudio.
  - **BaseSection**: Propiedades comunes para todas las secciones
    - `id`, `title`, `description`, `required`
  - **Tipos específicos de secciones**:
    - `OpenQuestionSection`: Preguntas de respuesta abierta
    - `MultipleChoiceSection`: Preguntas con opciones múltiples
    - `YesNoSection`: Preguntas de sí/no con diferentes estilos
    - `PrototypeTestSection`: Pruebas con prototipos de Figma
    - `WelcomeScreenSection`: Pantalla de bienvenida
    - `ThankYouSection`: Pantalla de agradecimiento al final
  - **FigmaUrl**: Estructura para URLs de prototipos de Figma

##### study-analytics.model.ts: Modelos para análisis de resultados de estudios
  - **StudyAnalytics**: Agregación de analíticas de todo el estudio
    - Tasas de finalización, tiempos promedio, total de respuestas
  - **SectionAnalytics**: Analíticas específicas por sección
    - Distribuciones para preguntas sí/no y múltiple opción
    - Palabras clave comunes para preguntas abiertas
  - **PrototypeAnalytics**: Análisis detallado de interacciones con prototipos
    - Tiempos por pantalla
    - Métricas de finalización

##### study-response.model.ts: Estructura para las respuestas de los participantes
  - **DeviceInfo**: Datos del dispositivo del participante
  - **BaseSectionResponse**: Estructura base para todas las respuestas
    - `sectionId`, `timestamp`, `type`
  - **Tipos específicos de respuestas**:
    - `OpenQuestionResponse`: Respuestas textuales
    - `MultipleChoiceResponse`: Opciones seleccionadas
    - `YesNoResponse`: Respuestas sí/no
    - `PrototypeTestResponse`: Log de eventos durante prueba de prototipo
    - `WelcomeScreenResponse`, `ThankYouResponse`: Registro de visualización
  - **StudyResponse**: Estructura completa de una respuesta a un estudio
    - Incluye todas las respuestas a secciones individuales
    - Tiempos de inicio/finalización
    - Estado de la respuesta

##### study.model.ts: Define la estructura principal de un estudio
  - **StudySettings**: Configuraciones del estudio
    - Opciones para respuestas múltiples, emails, barra de progreso
  - **Study**: Estructura completa del estudio
    - Propiedades básicas: `id`, `name`, `projectId`, `description`
    - `status`: Estado del estudio ('draft', 'published', 'completed', 'archived')
    - `sections`: Array de secciones que componen el estudio
    - URLs de acceso público y vista previa
    - Estadísticas de respuestas y tiempos
    - Referencias a participantes y respuestas
    - Metadatos de creación y actualización

#### Servicios (services/)

##### participant-result.service.ts
- **Funcionalidad principal**: Acceso y organización de resultados para análisis y visualización
- **Responsabilidades**:
  - **Consulta de resultados ya completados**:
    - `getResultsByStudyId()`: Obtiene todos los resultados de un estudio específico
    - `getResultsByParticipantId()`: Filtra resultados por participante individual
    - `getParticipantsByStudyId()`: Recupera todos los participantes de un estudio
  - **Estructuración para análisis**:
    - `transformResultsForVisualization()`: Prepara datos para componentes de visualización
    - `getResponsesGroupedBySection()`: Agrega respuestas por sección para análisis
  - **Uso principal**: Utilizado en las interfaces de análisis de resultados (study-results-page, study-analytics-page)

##### study-analytics.service.ts
- **Funcionalidad principal**: Análisis y procesamiento avanzado de resultados
- **Responsabilidades**:
  - **Agregación de datos**:
    - `generateStudySummary()`: Genera métricas generales del estudio
    - `calculateCompletionRates()`: Calcula tasas de finalización y abandono
    - `calculateAverageTimePerSection()`: Procesa tiempos medios de respuesta
  - **Transformación para gráficos**:
    - `getChartDataForMultipleChoice()`: Formatea datos para gráficos de barras
    - `getChartDataForYesNo()`: Prepara datos para visualizaciones de sí/no
    - `getHeatmapDataForPrototype()`: Prepara datos para mapas de calor en prototipos
  - **Exportación de datos**:
    - `exportToCsv()`: Exporta resultados en formato CSV
    - `prepareDataForExport()`: Formatea datos para diferentes formatos de exportación

##### study-prototype.service.ts
- **Funcionalidad principal**: Integración con la API de Figma para prototipos
- **Responsabilidades**:
  - **Comunicación con API de Figma**:
    - `getFile(fileId: string)`: Obtiene información de un archivo de Figma
    - `getImages(fileId: string, nodeIds: string[])`: Obtiene imágenes renderizadas
    - `validateFigmaUrl(url: string)`: Verifica que una URL de Figma sea válida
    - `extractFileAndNodeIds(url: string)`: Extrae IDs de archivo y nodos de una URL
  - **Seguimiento de eventos de prototipo**:
    - `trackPrototypeEvent(event: PrototypeEvent)`: Registra interacciones
    - `getFigmaNodeDataFromUrl(url: string)`: Obtiene metadatos de un nodo específico
    - `processPrototypeEvents(events: PrototypeEvent[])`: Procesa eventos para análisis

##### study-responses.service.ts
- **Funcionalidad principal**: Gestión del ciclo de vida de las respuestas de los participantes durante la realización del estudio
- **Responsabilidades**:
  - **Creación y actualización de respuestas en tiempo real**:
    - `createStudyResponse()`: Inicia una nueva sesión de participación
    - `updateSectionResponse()`: Guarda respuestas a cada sección conforme el usuario avanza
    - `completeStudy()`: Finaliza la participación y marca como completada
  - **Captura de información contextual**:
    - Recopila automáticamente información del dispositivo del participante
    - Registra timestamps precisos de cada interacción
  - **Actualización de estadísticas generales**:
    - Incrementa contadores de participación al completar un estudio
  - **Uso principal**: Utilizado en el flujo público de realización del estudio (study-public-page)

##### study-state.service.ts
- **Funcionalidad principal**: Gestión del estado interno de las secciones de un estudio
- **Responsabilidades**:
  - **Gestión del estado de las secciones por tipo**:
    - Mantiene observables separados para cada tipo de sección
    - `setWelcomeSection()`, `setYesNoSection()`, `setOpenQuestionSection()`, etc.
  - **Coordinación de guardado**:
    - `saveStudy()`: Orquesta el proceso de guardado de un estudio completo
    - `requestSave()`: Señaliza que se requiere guardar
    - Control de estado de guardado y última fecha guardada
  - **Transformación de datos**:
    - `removeUndefinedValues()`: Limpia datos para envío a Firebase

##### study.service.ts
- **Funcionalidad principal**: Gestión central de estudios y su ciclo de vida
- **Responsabilidades**:
  - **Gestión CRUD completa para estudios**:
    - `createStudy()`: Crea un nuevo estudio en Firestore
    - `getStudyById()`: Recupera un estudio específico por su ID
    - `getStudiesByProjectId()`: Obtiene todos los estudios de un proyecto
    - `updateStudy()`: Actualiza propiedades de un estudio existente
    - `deleteStudy()`: Elimina un estudio de la base de datos
  - **Gestión de estado del estudio**:
    - `getCurrentStudy()`: Observable con el estudio actualmente activo
    - `setCurrentStudy()`: Establece el estudio activo en la aplicación
    - `publishStudy()`: Cambia el estado a publicado y genera URL pública
  - **Persistencia local**:
    - Guarda/recupera datos de estudio en localStorage para trabajo offline
    - `saveToLocalStorage()`, `loadFromLocalStorage()`
  - **Gestión básica de respuestas**:
    - Funciones básicas para recuperar respuestas (delegado a otros servicios)

**Guía para implementar nuevas características**:
- Para características relacionadas con la **recopilación de respuestas durante la participación** → `study-responses.service.ts`
- Para características relacionadas con el **análisis y visualización de resultados completados** → `participant-result.service.ts`
- Para características relacionadas con **estructura y propiedades generales** de estudios → `study.service.ts`
- Para características de **edición y gestión de secciones** → `study-state.service.ts`
- Para características relacionadas con **integración con Figma** → `study-prototype.service.ts`
- Para características de **análisis y visualización** → `study-analytics.service.ts`
- Para características específicas de **participantes individuales** → `participant-result.service.ts`

#### Páginas (pages/)

##### study-creation-page
- **study-creation-page.component.html**:
  - Panel lateral con lista de secciones (welcome, preguntas, thank you)
  - Formularios dinámicos para cada tipo de sección
  - Panel de vista previa de la sección activa
  - Botón para agregar nuevas secciones con menú desplegable

- **study-creation-page.component.ts**:
  - Gestión de secciones del estudio (welcome, cuerpo, thank you)
  - Agregar/eliminar secciones dinámicamente
  - Selección de sección activa para edición
  - Guardado automático con debounce
  - Actualización en tiempo real de la vista previa
  - Inicialización de datos por tipo de sección
  - Carga de estudios existentes

##### study-results-page
- **study-results-page.component.html**:
  - Sidebar con toggle entre vista de resultados y participantes
  - Contador de participantes como medida de confianza
  - Lista de clips de preguntas/secciones seleccionables
  - Área principal de visualización de resultados
  - Componentes específicos para cada tipo de pregunta

- **study-results-page.component.ts**:
  - Carga de secciones del estudio
  - Carga de respuestas de participantes
  - Filtrado de secciones relevantes
  - Toggle entre vista de resultados y participantes individuales
  - Selección de sección o participante específico
  - Obtención de respuestas filtradas por sección

##### study-share-page
- **study-share-page.component.html**:
  - Título principal "Share your study with testers"
  - Grid de tarjetas seleccionables con opciones de compartir
  - Cada tarjeta con imagen, título y descripción
  - Área para futura tabla de métricas de participación

- **study-share-page.component.ts**:
  - Definición de opciones de compartir
  - Obtención del ID del estudio desde la ruta
  - Método para abrir dialog con link para compartir
  - Preparación de URL del estudio con base URL

##### study-analytics-page
- **study-analytics-page.component.html**:
  - Dashboard de análisis avanzado (implementación pendiente)
  - Espacio para gráficos y visualizaciones

- **study-analytics-page.component.ts**:
  - Componente base preparado para implementación futura
  - Espacio reservado para funcionalidades de análisis avanzado

##### study-public-page
- **study-public-page.component.html**:
  - Diseño dividido: formulario (1/3) e ilustraciones (2/3)
  - Barra de progreso interactiva con pasos
  - Contenedor dinámico para cada tipo de sección
  - Componentes específicos para cada tipo de pregunta
  - Botones de navegación (anterior/siguiente)
  - Ilustraciones adaptadas por tipo de sección

- **study-public-page.component.ts**:
  - Inicialización del estudio desde URL pública
  - Validación de estado publicado del estudio
  - Creación de nueva sesión de respuesta
  - Navegación entre secciones con animaciones
  - Guardado de respuestas por sección
  - Detección del tipo de sección actual
  - Formateo de respuestas según tipo de pregunta
  - Finalización del estudio y redirección

#### Componentes (components/)

##### toolbar
- **toolbar.component.html**:
  - Botón para navegar hacia atrás a la página del proyecto
  - Título editable del estudio
  - Indicador de guardado automático con timestamp
  - Botones de acción: Guardar, Publicar, Compartir
  - Estado de guardado con spinner de carga

- **toolbar.component.ts**:
  - Carga de datos del estudio actual
  - Emisión de eventos para guardar cambios
  - Apertura de dialog para editar nombre del estudio
  - Navegación al proyecto padre
  - Publicación del estudio con generación de URL pública
  - Integración con dialogs para compartir estudio

##### study-layout
- **study-layout.component.html**:
  - Estructura base con sidebar y área de contenido principal
  - Contendor para renderizar dinámicamente componentes de estudio
  - Layout adaptable para diferentes dispositivos

- **study-layout.component.ts**:
  - Inicialización de la estructura base
  - Contenedor para componentes específicos de páginas de estudio
  - Gestión del estado de navegación entre vistas

##### results/
###### yes-no-result
- **yes-no-result.component.html**:
  - Gráficos de barras para visualización de respuestas Sí/No
  - Contador de respuestas por opción
  - Porcentajes de cada respuesta
  - Lista de respuestas individuales

- **yes-no-result.component.ts**:
  - Recepción de datos de sección y respuestas
  - Cálculo de estadísticas (porcentajes, totales)
  - Filtrado de respuestas por sección específica
  - Métodos para obtener respuestas de participantes

###### prototype-test-result
- **prototype-test-result.component.html**:
  - Vista de imagen del prototipo con superposición de datos
  - Heatmap de clics y movimientos
  - Líneas de tiempo de interacción
  - Métricas de éxito/fracaso en la tarea

- **prototype-test-result.component.ts**:
  - Procesamiento de eventos de interacción con prototipos
  - Generación de visualizaciones de datos (heatmaps)
  - Cálculo de métricas de uso del prototipo
  - Agrupación de patrones de navegación

###### participant-result
- **participant-result.component.html**:
  - Detalles de un participante específico
  - Timeline de interacciones y respuestas
  - Visualización de tiempo por sección
  - Datos de dispositivo y entorno

- **participant-result.component.ts**:
  - Filtrado de respuestas por participante
  - Ordenamiento cronológico de interacciones
  - Cálculo de tiempo total y por sección
  - Formateo de datos para visualización

###### open-question-result
- **open-question-result.component.html**:
  - Lista de respuestas textuales de los participantes
  - Filtros para organizar respuestas
  - Tarjetas individuales por respuesta
  - Indicadores de datos demográficos

- **open-question-result.component.ts**:
  - Recepción de datos de sección tipo pregunta abierta
  - Listado de respuestas textuales de participantes
  - Filtrado de respuestas por sección específica
  - Obtención de texto de respuesta para cada participante

###### multiple-choice-result
- **multiple-choice-result.component.html**:
  - Gráficos de barras para cada opción
  - Porcentajes y conteos por opción
  - Lista detallada de selecciones por participante
  - Filtros para visualizar subconjuntos de datos

- **multiple-choice-result.component.ts**:
  - Recepción de datos de sección tipo opción múltiple
  - Cálculo de estadísticas por opción
  - Obtención de respuestas seleccionadas por participante
  - Generación de datos para gráficos con porcentajes

##### previews/
###### yes-no-preview
- **yes-no-preview.component.html**:
  - Renderizado de pregunta Sí/No según estilo seleccionado
  - Botones para opciones con diferentes estilos visuales
  - Texto descriptivo para cada opción
  - Indicador de selección actual

- **yes-no-preview.component.ts**:
  - Actualización de vista previa en tiempo real
  - Sincronización con servicio de estado de estudio
  - Procesamiento de datos de la sección
  - Emisión de eventos de selección de opción

###### welcome-screen-preview
- **welcome-screen-preview.component.html**:
  - Diseño de pantalla de bienvenida con ilustración
  - Título y descripción personalizables
  - Botón de comenzar estudio
  - Estilos visuales consistentes

- **welcome-screen-preview.component.ts**:
  - Suscripción a cambios en datos de bienvenida
  - Actualización de vista previa en tiempo real
  - Inicialización con datos por defecto
  - Sincronización con servicio de estado

###### thank-you-preview
- **thank-you-preview.component.html**:
  - Pantalla de finalización con ilustración
  - Animación de confeti para celebración
  - Mensaje personalizable de agradecimiento
  - Diseño centrado y llamativo

- **thank-you-preview.component.ts**:
  - Actualización de vista previa en tiempo real
  - Sincronización con servicio de estado de estudio
  - Procesamiento de datos de la sección
  - Control de animaciones de finalización

###### prototype-test-preview
- **prototype-test-preview.component.html**:
  - Iframe para visualizar prototipo de Figma
  - Estado vacío cuando no hay prototipo
  - Controles de interacción
  - Mensaje de carga durante la conexión

- **prototype-test-preview.component.ts**:
  - Gestión de conexión con Figma
  - Renderizado seguro de iframe
  - Control de estados de carga
  - Captura de eventos de interacción

###### open-question-preview
- **open-question-preview.component.html**:
  - Campo de texto para respuesta
  - Visualización de pregunta y descripción
  - Contador de caracteres (opcional)
  - Indicador de campo requerido

- **open-question-preview.component.ts**:
  - Validación de longitud mínima/máxima
  - Emisión de eventos de cambio de respuesta
  - Sincronización bidireccional con modelo
  - Integración con servicio de estado

##### participant-card
- **participant-card.component.html**:
  - Tarjeta con datos resumidos del participante
  - Identificador único y fecha de participación
  - Indicadores de estado (completado, en progreso)
  - Estilo visual para estado activo/seleccionado

- **participant-card.component.ts**:
  - Recepción de datos de participante
  - Formateo de identificadores para mostrar
  - Cálculo de subtítulos con estado y fecha
  - Manejo de estado activo/seleccionado

##### clip-element
- **clip-element.component.html**:
  - Contenedor con icono y título
  - Diferentes estilos según tipo de sección
  - Menú de opciones contextuales
  - Indicador visual de estado activo

- **clip-element.component.ts**:
  - Componente reutilizable para mostrar secciones
  - Control de eventos de eliminación
  - Adaptación visual según tipo de sección
  - Manejo de estado activo/seleccionado

##### forms/
###### yes-no-form
- **yes-no-form.component.html**:
  - Campos para título y descripción
  - Inputs para etiquetas de opciones Sí/No
  - Campos para descripciones adicionales
  - Selector de estilo visual (default, emoji, thumbs)

- **yes-no-form.component.ts**:
  - Actualización bidireccional de datos
  - Sincronización con servicio de estado
  - Cambio de estilos visuales
  - Persistencia de cambios en el modelo

###### welcome-screen-form
- **welcome-screen-form.component.html**:
  - Campos para título y descripción de bienvenida
  - Vista previa simplificada
  - Opciones de personalización

- **welcome-screen-form.component.ts**:
  - Actualización de estado en tiempo real
  - Emisión de eventos de cambio
  - Sincronización con servicio de estado
  - Manejo de cambios en formulario

###### thank-you-form
- **thank-you-form.component.html**:
  - Campos para título y descripción de agradecimiento
  - Opciones para personalizar mensaje final
  - Configuración de opciones adicionales

- **thank-you-form.component.ts**:
  - Actualización de datos en el modelo
  - Sincronización con servicio de estado
  - Control de campos de formulario
  - Persistencia de cambios

###### prototype-test-form
- **prototype-test-form.component.html**:
  - Campo para URL de Figma
  - Botón para importar frames
  - Grid de selección de frames
  - Configuración de pantalla inicial y objetivo

- **prototype-test-form.component.ts**:
  - Validación de URL de Figma
  - Integración con API de Figma
  - Extracción de frames como imágenes
  - Configuración de pantallas inicial/objetivo
  - Actualización del modelo con datos de frames

###### open-question-form
- **open-question-form.component.html**:
  - Campos para título y descripción
  - Opciones para limitar longitud de respuesta
  - Configuración de campo requerido

- **open-question-form.component.ts**:
  - Actualización de datos en el modelo
  - Control de límites de longitud
  - Sincronización con servicio de estado
  - Validación de datos ingresados

###### multiple-choice-form
- **multiple-choice-form.component.html**:
  - Campos para título y descripción
  - Gestión dinámica de opciones (agregar/eliminar)
  - Toggle para selección múltiple/única
  - Reordenamiento de opciones

- **multiple-choice-form.component.ts**:
  - Gestión de colección de opciones
  - Generación de IDs únicos para opciones
  - Actualización de modelo con cambios
  - Control de selección única/múltiple

#### Dialogs (dialogs/)

##### edit-study-name-dialog
- Formulario para editar nombre de estudio

##### share-study-dialog
- Opciones completas para compartir estudios
- Generación de enlaces y opciones de privacidad

================================================================
## Estructura de Ambiente y Configuración
================================================================

### environments/

#### firebase.config.ts
- **Configuración centralizada de Firebase**:
  - Exporta el objeto `firebaseConfig` con todos los parámetros necesarios:
    - `apiKey`: Clave de API para autenticación
    - `authDomain`: Dominio de autenticación de Firebase
    - `projectId`: ID del proyecto en Firebase
    - `storageBucket`: Bucket de almacenamiento en Firebase Storage
    - `messagingSenderId`: ID para Firebase Cloud Messaging
    - `appId`: ID de la aplicación en Firebase
  - **Punto único de verdad**: Todos los cambios a la configuración de Firebase se hacen aquí

#### environment.ts
- **Configuración general del entorno**:
  - `production`: Booleano que indica si es entorno de producción (false para desarrollo)
  - **Firebase**: Importa la configuración desde `firebase.config.ts`
    - `firebase: firebaseConfig` - Evita duplicación y mantiene DRY
  - **baseUrl**: URL base de la aplicación ('http://localhost:4200' en desarrollo)
  - **Figma API**:
    - Configuración centralizada para la integración con Figma:
      - `accessToken`: Token de acceso a la API de Figma (se establece en runtime)
      - `apiUrl`: URL base de la API de Figma ('https://api.figma.com/v1')

**Nota importante**: La configuración de la API de Figma solo debe definirse en `environment.ts` y todos los servicios deben obtenerla de allí para evitar duplicación. El servicio `study-prototype.service.ts` utiliza esta configuración centralizada.

================================================================
## Archivos Públicos y Assets
================================================================

### public/assets/
- **illustrations/**: SVGs para ilustraciones de la aplicación
  - welcome.svg: Ilustración de bienvenida
  - thank-you.svg: Ilustración de agradecimiento
- **img/logos/**: Logos de la aplicación en diferentes formatos

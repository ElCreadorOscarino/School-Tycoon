// ============================================
// School Tycoon - Expanded Event Pool
// Self-contained module — no internal imports
// ============================================

export interface LocalEventTemplate {
  title: string;
  description: string;
  emoji: string;
  impact: 'positive' | 'neutral' | 'negative';
  isStaffEvent?: boolean;
  isInspection?: boolean;
  condition?: (state: any) => boolean;
  category?: string;
  minWeek?: number;
  maxRepeats?: number;
  options: {
    text: string;
    reputationChange: number;
    moneyChange: number;
    satisfactionChange: number;
    consequence: string;
  }[];
}

// Cooldown: weeks before a used event can reappear
export const EVENT_COOLDOWN_WEEKS = 4;

// ============================================
// ACADEMIC EVENTS (10)
// ============================================
const academicEvents: LocalEventTemplate[] = [
  // ORIGINAL 1
  {
    title: 'Estudiante gana concurso nacional',
    description:
      'Uno de tus estudiantes ha ganado el primer lugar en un concurso nacional de matematicas. La noticia ha trascendido!',
    emoji: '🏆',
    impact: 'positive',
    category: 'academic',
    options: [
      {
        text: 'Organizar celebracion',
        reputationChange: 5,
        moneyChange: -2000,
        satisfactionChange: 8,
        consequence: 'La celebracion fue un exito. Todos estan orgullosos!',
      },
      {
        text: 'Reconocerlo publicamente',
        reputationChange: 3,
        moneyChange: 0,
        satisfactionChange: 5,
        consequence: 'El reconocimiento publico motivo a otros estudiantes.',
      },
      {
        text: 'Reconocimiento privado',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 2,
        consequence: 'El estudiante aprecio el gesto.',
      },
    ],
  },
  // ORIGINAL: Estudiantes ganan feria de ciencias
  {
    title: 'Estudiantes ganan feria de ciencias',
    description:
      'Tus estudiantes han ganado el primer premio en la feria regional de ciencias. Esto eleva el prestigio de la escuela!',
    emoji: '🔬',
    impact: 'positive',
    category: 'academic',
    condition: (s) => s.activeStudents >= 5 && s.computerLabEnabled,
    options: [
      {
        text: 'Invertir en laboratorio',
        reputationChange: 5,
        moneyChange: -5000,
        satisfactionChange: 7,
        consequence: 'El laboratorio mejorado inspira a mas estudiantes.',
      },
      {
        text: 'Celebrar modestamente',
        reputationChange: 3,
        moneyChange: -1000,
        satisfactionChange: 4,
        consequence: 'La celebracion motivo a todos.',
      },
    ],
  },
  // NEW: Competencia academica departamental
  {
    title: 'Competencia academica departamental',
    description:
      'La secretaria de educacion ha invitado a tu escuela a participar en la competencia academica departamental. El costo de inscripcion es elevado pero la exposicion seria invaluable.',
    emoji: '📐',
    impact: 'neutral',
    category: 'academic',
    minWeek: 4,
    options: [
      {
        text: 'Participar con equipo completo',
        reputationChange: 4,
        moneyChange: -4000,
        satisfactionChange: 5,
        consequence:
          'Tu escuela quedo en tercer lugar. Excelente exposicion para futuras inscripciones!',
      },
      {
        text: 'Participar con equipo reducido',
        reputationChange: 2,
        moneyChange: -1500,
        satisfactionChange: 3,
        consequence: 'Buen resultado considerando los recursos invertidos.',
      },
      {
        text: 'Declinar la invitacion',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'Algunos padres se preguntan por que la escuela no compitio.',
      },
    ],
  },
  // NEW: Oportunidad de becas
  {
    title: 'Oportunidad de becas para estudiantes destacados',
    description:
      'Una fundacion internacional ofrece becas completas para estudiantes con rendimiento academico sobresaliente. Tres de tus estudiantes son elegibles, pero necesitas gestionar la documentacion.',
    emoji: '🎓',
    impact: 'positive',
    category: 'academic',
    minWeek: 6,
    condition: (s) => s.academicPerformance >= 60,
    options: [
      {
        text: 'Gestionar todas las becas',
        reputationChange: 5,
        moneyChange: -1500,
        satisfactionChange: 8,
        consequence:
          'Los tres estudiantes obtuvieron beca! La noticia aparecio en periodicos locales.',
      },
      {
        text: 'Gestionar solo una',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 4,
        consequence: 'Un estudiante consiguio la beca. Los otros estan motivados para intentar el proximo ano.',
      },
      {
        text: 'No participar este ano',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'Los estudiantes y sus familias sintieron que no se les apoyo lo suficiente.',
      },
    ],
  },
  // NEW: Resultados de examenes sorprendentes
  {
    title: 'Resultados de examenes estandarizados',
    description:
      'Acaban de publicarse los resultados de los examenes estandarizados nacionales. Tu escuela ha tenido resultados mixtos: matematicas excelentes pero lenguaje necesita mejorar.',
    emoji: '📊',
    impact: 'neutral',
    category: 'academic',
    minWeek: 8,
    condition: (s) => s.activeStudents >= 10,
    options: [
      {
        text: 'Programa de refuerzo en lenguaje',
        reputationChange: 3,
        moneyChange: -3500,
        satisfactionChange: 4,
        consequence:
          'El programa de refuerzo dio resultados rapidos. Los padres estan complacidos.',
      },
      {
        text: 'Celebrar lo logrado',
        reputationChange: 1,
        moneyChange: -800,
        satisfactionChange: 3,
        consequence: 'Se reconocio el esfuerzo en matematicas, pero lenguaje sigue siendo un reto.',
      },
      {
        text: 'Ignorar los resultados',
        reputationChange: -4,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'Los padres estan preocupados por los resultados en lenguaje.',
      },
    ],
  },
  // NEW: Conferencista invitado
  {
    title: 'Conferencista invitado disponible',
    description:
      'Un cientifico reconocido ofrece dar una charla gratuita en tu escuela. Solo necesitas cubrir los gastos de viaje y alojamiento.',
    emoji: '🎤',
    impact: 'positive',
    category: 'academic',
    minWeek: 3,
    options: [
      {
        text: 'Invitar al conferencista',
        reputationChange: 4,
        moneyChange: -2500,
        satisfactionChange: 6,
        consequence:
          'La charla fue inspiradora. Varios estudiantes ahora quieren estudiar ciencias.',
      },
      {
        text: 'Proponer charla virtual (gratis)',
        reputationChange: 2,
        moneyChange: -200,
        satisfactionChange: 3,
        consequence: 'La charla virtual fue buena, pero falto la magia del presencia.',
      },
    ],
  },
  // NEW: Torneo de debate
  {
    title: 'Torneo de debate intercolegial',
    description:
      'Tu escuela ha sido invitada a participar en un torneo de debate intercolegial. Los estudiantes de debate estan emocionados pero necesitan entrenamiento y uniformes.',
    emoji: '🗣️',
    impact: 'neutral',
    category: 'academic',
    minWeek: 5,
    options: [
      {
        text: 'Preparar al equipo a fondo',
        reputationChange: 4,
        moneyChange: -3000,
        satisfactionChange: 5,
        consequence: 'El equipo de debate llego a la final! Gran prestigio academico.',
      },
      {
        text: 'Participar sin preparacion extra',
        reputationChange: 1,
        moneyChange: -500,
        satisfactionChange: 2,
        consequence: 'El equipo paso la primera ronda pero fue eliminado. Buena experiencia.',
      },
      {
        text: 'No participar',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'Los estudiantes de debate estan decepcionados.',
      },
    ],
  },
  // NEW: Concurso de ortografia
  {
    title: 'Concurso distrital de ortografia',
    description:
      'El concurso distrital de ortografia se acerca y tu escuela tiene dos candidatos fuertes. Quieres enviarlos con la mejor preparacion posible.',
    emoji: '📝',
    impact: 'positive',
    category: 'academic',
    minWeek: 6,
    condition: (s) => s.activeStudents >= 5,
    options: [
      {
        text: 'Contratar preparador especializado',
        reputationChange: 4,
        moneyChange: -2000,
        satisfactionChange: 5,
        consequence: 'Uno de tus estudiantes gano el concurso! Titulares en el periodico local.',
      },
      {
        text: 'Preparacion interna',
        reputationChange: 2,
        moneyChange: -300,
        satisfactionChange: 3,
        consequence: 'Tus estudiantes quedaron en el top 5. Muy buen resultado.',
      },
    ],
  },
  // NEW: Exposicion de arte estudiantil
  {
    title: 'Exposicion de arte estudiantil',
    description:
      'Los estudiantes de arte quieren organizar una exposicion de sus obras. Necesitan materiales, marcos y un espacio adecuado para exhibir.',
    emoji: '🎨',
    impact: 'positive',
    category: 'academic',
    options: [
      {
        text: 'Apoyar la exposicion completamente',
        reputationChange: 3,
        moneyChange: -2500,
        satisfactionChange: 7,
        consequence: 'La exposicion fue un exito. Padres y comunidad asistieron en masa.',
      },
      {
        text: 'Exposicion modesta en pasillos',
        reputationChange: 1,
        moneyChange: -400,
        satisfactionChange: 4,
        consequence: 'Los estudiantes estan felices de que sus obras se muestren.',
      },
      {
        text: 'No es prioridad ahora',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'Los estudiantes de arte se sienten ignorados.',
      },
    ],
  },
  // NEW: Maraton de lectura
  {
    title: 'Maraton de lectura escolar',
    description:
      'Se propone organizar una maraton de lectura de 24 horas para fomentar el habito lector. Los estudiantes participarian en turnos y habria premios.',
    emoji: '📚',
    impact: 'positive',
    category: 'academic',
    condition: (s) => s.libraryEnabled,
    options: [
      {
        text: 'Organizar con premios y actividades',
        reputationChange: 3,
        moneyChange: -2000,
        satisfactionChange: 6,
        consequence: 'Los estudiantes leyeron 500 libros en 24 horas. Record escolar!',
      },
      {
        text: 'Maraton sencilla sin premios',
        reputationChange: 2,
        moneyChange: -300,
        satisfactionChange: 3,
        consequence: 'Buena participacion. El habito lector esta mejorando.',
      },
    ],
  },
  // NEW: Olimpiada de matematicas
  {
    title: 'Olimpiada de matematicas nacional',
    description:
      'Tu escuela ha sido preseleccionada para enviar estudiantes a la Olimpiada Nacional de Matematicas. Necesitas seleccionar y preparar a los mejores candidatos.',
    emoji: '🧮',
    impact: 'positive',
    category: 'academic',
    minWeek: 10,
    condition: (s) => s.academicPerformance >= 55 && s.activeStudents >= 8,
    options: [
      {
        text: 'Entrenamiento intensivo con tutor',
        reputationChange: 5,
        moneyChange: -4000,
        satisfactionChange: 6,
        consequence: 'Un estudiante obtuvo medalla de plata! Un hito para la escuela.',
      },
      {
        text: 'Preparacion con profesores actuales',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 3,
        consequence: 'Participacion honrosa. Los estudiantes ganaron experiencia valiosa.',
      },
    ],
  },
];

// ============================================
// SOCIAL EVENTS (8)
// ============================================
const socialEvents: LocalEventTemplate[] = [
  // NEW: Baile escolar
  {
    title: 'Propuesta de baile de graduacion',
    description:
      'Los estudiantes de ultimo ano quieren organizar un baile de graduacion. Necesitan un lugar, decoracion, musica y catering. El costo puede ser significativo.',
    emoji: '💃',
    impact: 'neutral',
    category: 'social',
    minWeek: 12,
    options: [
      {
        text: 'Baile de lujo en salon externo',
        reputationChange: 4,
        moneyChange: -6000,
        satisfactionChange: 8,
        consequence: 'El baile fue inolvidable. Los estudiantes lo recordaran siempre.',
      },
      {
        text: 'Baile en el patio de la escuela',
        reputationChange: 2,
        moneyChange: -1500,
        satisfactionChange: 5,
        consequence: 'El baile fue divertido a pesar del presupuesto limitado.',
      },
      {
        text: 'No hay presupuesto para eso',
        reputationChange: -3,
        moneyChange: 0,
        satisfactionChange: -6,
        consequence: 'Los estudiantes estan furiosos y decepcionados.',
      },
    ],
  },
  // NEW: Festival cultural
  {
    title: 'Festival cultural multicultural',
    description:
      'Un grupo de padres de diferentes paises quiere organizar un festival multicultural con comida tipica, danzas y musica de sus paises de origen.',
    emoji: '🌍',
    impact: 'positive',
    category: 'social',
    options: [
      {
        text: 'Apoyar con presupuesto completo',
        reputationChange: 4,
        moneyChange: -3500,
        satisfactionChange: 7,
        consequence:
          'El festival fue espectacular. La comunidad entera participo y la escuela fue noticia.',
      },
      {
        text: 'Ceder el espacio, los padres organizan',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 5,
        consequence: 'Los padres hicieron un gran trabajo. Excelente integracion comunitaria.',
      },
    ],
  },
  // NEW: Celebracion dia del nino
  {
    title: 'Celebracion del Dia del Nino',
    description:
      'Se acerca el Dia del Nino y los estudiantes mas pequenos estan emocionados. Quieren actividades especiales, sorpresas y algo de comida.',
    emoji: '🎈',
    impact: 'positive',
    category: 'social',
    options: [
      {
        text: 'Fiesta grande con sorpresas',
        reputationChange: 2,
        moneyChange: -2500,
        satisfactionChange: 8,
        consequence: 'Los ninos disfrutaron como nunca. Los padres estan encantados.',
      },
      {
        text: 'Actividades sencillas en clase',
        reputationChange: 1,
        moneyChange: -400,
        satisfactionChange: 4,
        consequence: 'Fue un dia especial aunque sin grandes lujos.',
      },
    ],
  },
  // NEW: Fiesta de cumpleanos sorpresa
  {
    title: 'Fiesta de cumpleanos sorpresa para un profesor',
    description:
      'Los estudiantes quieren organizar una fiesta sorpresa para un profesor muy querido que cumple anos. Quieren un pastel y decoracion.',
    emoji: '🎂',
    impact: 'positive',
    category: 'social',
    condition: (s) => s.activeTeachers >= 1,
    options: [
      {
        text: 'Contribuir con presupuesto',
        reputationChange: 2,
        moneyChange: -800,
        satisfactionChange: 5,
        consequence: 'El profesor se conmovio. Esos gestos fortalecen los lazos escuela-comunidad.',
      },
      {
        text: 'Dejar que los estudiantes lo organicen',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 3,
        consequence: 'Los estudiantes lo organizaron con sus propios recursos. Hermoso gesto.',
      },
    ],
  },
  // NEW: Torneo deportivo interscolar
  {
    title: 'Torneo deportivo interscolar',
    description:
      'Escuelas vecinas quieren organizar un torneo deportivo interscolar de futbol y baloncesto. Tu escuela puede ser sede si asume algunos costos.',
    emoji: '🏀',
    impact: 'neutral',
    category: 'social',
    condition: (s) => s.sportsAreaEnabled,
    minWeek: 6,
    options: [
      {
        text: 'Ser sede del torneo',
        reputationChange: 4,
        moneyChange: -3000,
        satisfactionChange: 6,
        consequence: 'El torneo fue un exito total. Tu escuela gano en futbol y fue sede ejemplar.',
      },
      {
        text: 'Participar como invitado',
        reputationChange: 2,
        moneyChange: -800,
        satisfactionChange: 4,
        consequence: 'Buena participacion. Los estudiantes disfrutaron la competencia.',
      },
      {
        text: 'Declinar la invitacion',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'Los estudiantes deportistas estan decepcionados.',
      },
    ],
  },
  // NEW: Show de talentos
  {
    title: 'Show de talentos estudiantil',
    description:
      'Los estudiantes quieren organizar un show de talentos donde puedan presentar canto, baile, magia y otras habilidades. Necesitan equipo de sonido y escenario.',
    emoji: '⭐',
    impact: 'positive',
    category: 'social',
    options: [
      {
        text: 'Alquilar equipo profesional',
        reputationChange: 3,
        moneyChange: -2500,
        satisfactionChange: 7,
        consequence: 'El show fue increible. Se descubrieron talentos ocultos.',
      },
      {
        text: 'Show sencillo sin equipo especial',
        reputationChange: 1,
        moneyChange: -200,
        satisfactionChange: 4,
        consequence: 'Los estudiantes disfrutaron presentarse aunque el sonido no fuera perfecto.',
      },
    ],
  },
  // NEW: Dia de agradecimiento a los padres
  {
    title: 'Dia de agradecimiento a los padres',
    description:
      'El consejo estudiantil quiere organizar un dia especial para agradecer a los padres su apoyo. Proponen desayuno, tarjetas hechas a mano y una small presentacion.',
    emoji: '❤️',
    impact: 'positive',
    category: 'social',
    options: [
      {
        text: 'Organizar evento completo',
        reputationChange: 3,
        moneyChange: -1800,
        satisfactionChange: 5,
        consequence: 'Los padres se emocionaron. La relacion escuela-familia se fortalecio.',
      },
      {
        text: 'Tarjetas y presentacion en clase',
        reputationChange: 2,
        moneyChange: -200,
        satisfactionChange: 4,
        consequence: 'Simple pero conmovedor. Los padres valoraron el gesto.',
      },
    ],
  },
  // NEW: Activacion de club estudiantil
  {
    title: 'Activacion de club estudiantil',
    description:
      'Un grupo de estudiantes quiere fundar un club de periodismo escolar. Quieren publicar un periodico mensual con noticias de la escuela y la comunidad.',
    emoji: '📰',
    impact: 'neutral',
    category: 'social',
    options: [
      {
        text: 'Aprobar con presupuesto para impresion',
        reputationChange: 3,
        moneyChange: -1200,
        satisfactionChange: 5,
        consequence: 'El periodico escolar es un exito. Mejora la comunicacion interna.',
      },
      {
        text: 'Aprobar en formato digital (gratis)',
        reputationChange: 2,
        moneyChange: 0,
        satisfactionChange: 3,
        consequence: 'El periodico digital tiene buena difusion en redes.',
      },
      {
        text: 'Rechazar por ahora',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'Los estudiantes se sintieron coartados en su iniciativa.',
      },
    ],
  },
];

// ============================================
// INFRASTRUCTURE EVENTS (8)
// ============================================
const infrastructureEvents: LocalEventTemplate[] = [
  // ORIGINAL: Goteras por falta de mantenimiento
  {
    title: 'Goteras por falta de mantenimiento',
    description:
      'Las lluvias han causado goteras en varias aulas. Los estudiantes no pueden usar esos espacios.',
    emoji: '🌧️',
    impact: 'negative',
    category: 'infrastructure',
    options: [
      {
        text: 'Reparar de inmediato',
        reputationChange: 2,
        moneyChange: -8000,
        satisfactionChange: 3,
        consequence: 'Las reparaciones se completaron rapidamente.',
      },
      {
        text: 'Reparar despues',
        reputationChange: -4,
        moneyChange: -2000,
        satisfactionChange: -5,
        consequence: 'Las goteras empeoraron y cuestan mas reparar.',
      },
    ],
  },
  // ORIGINAL: Lluvia intensa dana el techo
  {
    title: 'Lluvia intensa dana el techo',
    description:
      'Una lluvia torrencial ha dano parte del techo del edificio. Se necesitan reparaciones urgentes.',
    emoji: '⛈️',
    impact: 'neutral',
    category: 'infrastructure',
    options: [
      {
        text: 'Reparar ahora',
        reputationChange: 1,
        moneyChange: -6000,
        satisfactionChange: 2,
        consequence: 'Las reparaciones fueron completadas antes de la proxima lluvia.',
      },
      {
        text: 'Esperar y ver',
        reputationChange: -2,
        moneyChange: -1000,
        satisfactionChange: -2,
        consequence: 'El dano empeoro y las reparaciones son mas caras ahora.',
      },
    ],
  },
  // ORIGINAL: Fallo tecnologico
  {
    title: 'Fallo tecnologico',
    description:
      'El sistema de internet ha fallado y las clases que dependen de tecnologia se han visto afectadas. Los padres estan preocupados.',
    emoji: '💻',
    impact: 'negative',
    category: 'infrastructure',
    condition: (s) => s.internetType !== 'none',
    options: [
      {
        text: 'Contratar tecnico urgente',
        reputationChange: 2,
        moneyChange: -3000,
        satisfactionChange: 2,
        consequence: 'El problema se resolvio en horas. Las clases continuaron normal.',
      },
      {
        text: 'Esperar al proveedor',
        reputationChange: -3,
        moneyChange: -500,
        satisfactionChange: -4,
        consequence: 'Tomo 3 dias resolver el problema. Muchas clases se perdieron.',
      },
    ],
  },
  // NEW: Apagon electrico prolongado
  {
    title: 'Apagon electrico prolongado',
    description:
      'Un corte de energia ha dejado la escuela sin luz por tiempo indefinido. Las clases se suspenden parcialmente y los padres exigen soluciones.',
    emoji: '🔌',
    impact: 'negative',
    category: 'infrastructure',
    options: [
      {
        text: 'Alquilar generador de emergencia',
        reputationChange: 2,
        moneyChange: -3500,
        satisfactionChange: 2,
        consequence: 'El generador permitio continuar las clases. Los padres agradecen la rapida respuesta.',
      },
      {
        text: 'Enviar estudiantes a casa',
        reputationChange: -3,
        moneyChange: -1000,
        satisfactionChange: -4,
        consequence: 'Los padres molesto. Perdida de dias lectivos importantes.',
      },
      {
        text: 'Clases al aire libre',
        reputationChange: 1,
        moneyChange: -200,
        satisfactionChange: 1,
        consequence: 'Solucion creativa pero limitada. Solo algunas materias se pudieron dictar.',
      },
    ],
  },
  // NEW: Fuga de agua en banos
  {
    title: 'Fuga de agua grave en banos',
    description:
      'Se ha detectado una fuga de agua seria en los banos del segundo piso. El agua esta danando las paredes y el piso. Se necesita un plomero urgente.',
    emoji: '🚿',
    impact: 'negative',
    category: 'infrastructure',
    options: [
      {
        text: 'Reparacion de emergencia',
        reputationChange: 2,
        moneyChange: -5000,
        satisfactionChange: 3,
        consequence: 'La fuga fue controlada y reparada. Dano menor en paredes.',
      },
      {
        text: 'Cerrar banos temporalmente',
        reputationChange: -4,
        moneyChange: -500,
        satisfactionChange: -6,
        consequence: 'Los estudiantes y profesores estan inconformes sin banos disponibles.',
      },
    ],
  },
  // NEW: Plaga de insectos
  {
    title: 'Plaga de insectos en la escuela',
    description:
      'Se ha reportado una plaga de cucarachas en la cocina y areas de almacen. Esto es un riesgo sanitario que necesita atencion inmediata.',
    emoji: '🪳',
    impact: 'negative',
    category: 'infrastructure',
    options: [
      {
        text: 'Fumigacion profesional completa',
        reputationChange: 2,
        moneyChange: -4000,
        satisfactionChange: 3,
        consequence: 'La fumigacion elimino la plaga. Se implementaron medidas preventivas.',
      },
      {
        text: 'Fumigacion basica y barata',
        reputationChange: 0,
        moneyChange: -1200,
        satisfactionChange: 1,
        consequence: 'Se redujo la plaga pero no se elimino completamente.',
      },
      {
        text: 'No hacer nada ahora',
        reputationChange: -6,
        moneyChange: 0,
        satisfactionChange: -8,
        consequence: 'La plaga empeoro. El ministerio de salud emitio una advertencia.',
      },
    ],
  },
  // NEW: Renovacion de pintura
  {
    title: 'Pintura deteriorada en pasillos',
    description:
      'Los pasillos y aulas tienen la pintura descascarada y se ven deteriorados. Algunos padres han comentado que la escuela luce descuidada.',
    emoji: '🎨',
    impact: 'neutral',
    category: 'infrastructure',
    options: [
      {
        text: 'Renovacion completa',
        reputationChange: 3,
        moneyChange: -6000,
        satisfactionChange: 5,
        consequence: 'La escuela luce como nueva. Estudiantes y padres estan encantados.',
      },
      {
        text: 'Pintar solo areas visibles',
        reputationChange: 1,
        moneyChange: -2000,
        satisfactionChange: 2,
        consequence: 'Mejoro la apariencia general pero faltan detalles.',
      },
      {
        text: 'No es prioritario',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'La escuela sigue luciendo mal. Primeras impresiones negativas.',
      },
    ],
  },
  // NEW: Falla del aire acondicionado
  {
    title: 'Falla del aire acondicionado',
    description:
      'El sistema de aire acondicionado se ha descompuesto en pleno verano. Las aulas son insoportablemente calurosas y los estudiantes no pueden concentrarse.',
    emoji: '🥵',
    impact: 'negative',
    category: 'infrastructure',
    minWeek: 10,
    options: [
      {
        text: 'Reparacion inmediata',
        reputationChange: 2,
        moneyChange: -5000,
        satisfactionChange: 4,
        consequence: 'El aire acondicionado fue reparado. Las clases vuelven a ser confortables.',
      },
      {
        text: 'Comprar ventiladores y esperar',
        reputationChange: -1,
        moneyChange: -800,
        satisfactionChange: -2,
        consequence: 'Los ventiladores ayudan un poco pero no son suficientes.',
      },
      {
        text: 'Solicitar presupuesto y esperar',
        reputationChange: -3,
        moneyChange: -500,
        satisfactionChange: -5,
        consequence: 'Los estudiantes sufren el calor. Quejas de padres aumentan.',
      },
    ],
  },
  // NEW: Danos en el patio de recreo
  {
    title: 'Danos en el patio de recreo',
    description:
      'Los juegos del patio de recreo se han deteriorado peligrosamente. Un estudiante casi se lastima en el tobogan roto. Se necesita actuar rapido.',
    emoji: '🛝',
    impact: 'negative',
    category: 'infrastructure',
    options: [
      {
        text: 'Reparar y mejorar equipos',
        reputationChange: 3,
        moneyChange: -7000,
        satisfactionChange: 6,
        consequence: 'Los nuevos equipos son seguros y divertidos. Los ninos estan felices.',
      },
      {
        text: 'Cerrar el area temporalmente',
        reputationChange: -1,
        moneyChange: -500,
        satisfactionChange: -3,
        consequence: 'Los ninos no tienen donde recrearse. Se aburren en los recreos.',
      },
      {
        text: 'Solo reparar lo roto',
        reputationChange: 1,
        moneyChange: -3000,
        satisfactionChange: 2,
        consequence: 'Se repararon los danos criticos pero otros equipos siguen deteriorados.',
      },
    ],
  },
  // NEW: Problemas en el estacionamiento
  {
    title: 'Problemas en el estacionamiento',
    description:
      'El estacionamiento de la escuela se ha inundado por mal drenaje. Varios padres han danado sus vehiculos. Exigen una solucion inmediata.',
    emoji: '🚗',
    impact: 'negative',
    category: 'infrastructure',
    options: [
      {
        text: 'Reconstruir el drenaje',
        reputationChange: 3,
        moneyChange: -8000,
        satisfactionChange: 4,
        consequence: 'El estacionamiento ahora tiene excelente drenaje. Los padres estan satisfechos.',
      },
      {
        text: 'Mejora parcial del drenaje',
        reputationChange: 1,
        moneyChange: -3000,
        satisfactionChange: 1,
        consequence: 'Mejoro pero en lluvias fuertes todavia se inunda parcialmente.',
      },
      {
        text: 'No es nuestra responsabilidad',
        reputationChange: -5,
        moneyChange: 0,
        satisfactionChange: -6,
        consequence: 'Los padres estan furiosos. Algunos amenazan con retirar a sus hijos.',
      },
    ],
  },
];

// ============================================
// FINANCIAL EVENTS (8)
// ============================================
const financialEvents: LocalEventTemplate[] = [
  // ORIGINAL: Donacion inesperada
  {
    title: 'Donacion inesperada',
    description:
      'Un ex-alumno exitoso ha decidido donar una cantidad significativa a la escuela como agradecimiento.',
    emoji: '💰',
    impact: 'positive',
    category: 'financial',
    options: [
      {
        text: 'Agradecer publicamente',
        reputationChange: 2,
        moneyChange: 15000,
        satisfactionChange: 3,
        consequence: 'La donacion fue de $15,000. El ex-alumno esta feliz!',
      },
      {
        text: 'Invertir en mejoras',
        reputationChange: 3,
        moneyChange: 10000,
        satisfactionChange: 5,
        consequence: 'Los $10,000 se usaron para mejorar las instalaciones.',
      },
    ],
  },
  // NEW: Evento de recaudacion de fondos
  {
    title: 'Propuesta de evento de recaudacion',
    description:
      'El comite de padres propone organizar una gala benéfica para recaudar fondos. El costo de organizacion es considerable pero podria generar buenos ingresos.',
    emoji: '🎟️',
    impact: 'neutral',
    category: 'financial',
    options: [
      {
        text: 'Gala grande con invitados especiales',
        reputationChange: 3,
        moneyChange: 8000,
        satisfactionChange: 4,
        consequence: 'La gala recaudo $20,000! Despues de costos, ganancia neta de $8,000.',
      },
      {
        text: 'Evento comunitario sencillo',
        reputationChange: 1,
        moneyChange: 2000,
        satisfactionChange: 3,
        consequence: 'Se recaudaron $3,500. Modesto pero positivo.',
      },
      {
        text: 'Es demasiada complicacion',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -1,
        consequence: 'Los padres se sintieron ignorados. Perdida de oportunidad.',
      },
    ],
  },
  // NEW: Recorte presupuestal del gobierno
  {
    title: 'Recorte presupuestal del gobierno',
    description:
      'El ministerio de educacion ha anunciado un recorte presupuestal que afecta la asignacion mensual a tu escuela. Necesitas ajustar gastos.',
    emoji: '📉',
    impact: 'negative',
    category: 'financial',
    minWeek: 8,
    options: [
      {
        text: 'Buscar fuentes alternativas de ingreso',
        reputationChange: 2,
        moneyChange: -2000,
        satisfactionChange: 1,
        consequence: 'Se organizaron actividades que compensaron parcialmente el recorte.',
      },
      {
        text: 'Reducir gastos operativos',
        reputationChange: 0,
        moneyChange: -1500,
        satisfactionChange: -3,
        consequence: 'Los recortes afectaron servicios. Estudiantes y padres notan la diferencia.',
      },
      {
        text: 'Aumentar la colegiatura',
        reputationChange: -4,
        moneyChange: 0,
        satisfactionChange: -5,
        consequence: 'Los padres estan furiosos. Algunos consideran cambiar de escuela.',
      },
    ],
  },
  // NEW: Oportunidad de subvencion
  {
    title: 'Oportunidad de subvencion educativa',
    description:
      'Una ONG internacional ofrece una subvencion de $12,000 para escuelas que implementen programas de inclusion educativa. El proceso de solicitud es riguroso.',
    emoji: '📋',
    impact: 'positive',
    category: 'financial',
    minWeek: 4,
    options: [
      {
        text: 'Contratar asesor para la solicitud',
        reputationChange: 3,
        moneyChange: -2000,
        satisfactionChange: 4,
        consequence: 'La subvencion fue aprobada! $12,000 para programas de inclusion.',
      },
      {
        text: 'Solicitar sin ayuda externa',
        reputationChange: 1,
        moneyChange: -200,
        satisfactionChange: 2,
        consequence: 'La solicitud fue rechazada por detalles tecnicos. Intentar de nuevo el proximo ano.',
      },
    ],
  },
  // NEW: Reclamo de seguro
  {
    title: 'Reclamo de seguro por danos',
    description:
      'Los danos causados por una tormenta reciente son cubiertos por tu seguro escolar. Sin embargo, el proceso de reclamo requiere documentacion y tiempo.',
    emoji: '🔖',
    impact: 'neutral',
    category: 'financial',
    options: [
      {
        text: 'Contratar gestor de seguros',
        reputationChange: 1,
        moneyChange: 5000,
        satisfactionChange: 2,
        consequence: 'El gestor logro el maximo reclamo. Se recibieron $5,000.',
      },
      {
        text: 'Gestionar el reclamo internamente',
        reputationChange: 0,
        moneyChange: 2500,
        satisfactionChange: 1,
        consequence: 'El reclamo se aprobo parcialmente. Se recibieron $2,500.',
      },
    ],
  },
  // NEW: Robo de equipo escolar
  {
    title: 'Robo de equipo escolar',
    description:
      'Durante el fin de semana, ladrones entraron a la escuela y robaron proyectores y computadoras. Las camaras de seguridad grabaron el incidente.',
    emoji: '🔒',
    impact: 'negative',
    category: 'financial',
    options: [
      {
        text: 'Denunciar y reemplazar equipo',
        reputationChange: 1,
        moneyChange: -8000,
        satisfactionChange: 2,
        consequence: 'Se presento la denuncia. El seguro cubrio parcialmente el reemplazo.',
      },
      {
        text: 'Solo denunciar',
        reputationChange: 0,
        moneyChange: -500,
        satisfactionChange: -3,
        consequence: 'Las clases se ven afectadas por la falta de equipo.',
      },
      {
        text: 'Mejorar seguridad para evitar futuros robos',
        reputationChange: 2,
        moneyChange: -10000,
        satisfactionChange: 3,
        consequence: 'Se instalo nuevo sistema de seguridad y se reemplazo el equipo robado.',
      },
    ],
  },
  // NEW: Aumento de precios de proveedores
  {
    title: 'Aumento de precios de proveedores',
    description:
      'Los principales proveedores de la escuela han aumentado sus precios un 20%. Esto afecta la cafetería, materiales y servicios generales.',
    emoji: '📈',
    impact: 'negative',
    category: 'financial',
    condition: (s) => s.cafeteriaBuilt,
    options: [
      {
        text: 'Buscar nuevos proveedores',
        reputationChange: 2,
        moneyChange: -1500,
        satisfactionChange: 1,
        consequence: 'Se encontraron proveedores con mejores precios. Ahorro a largo plazo.',
      },
      {
        text: 'Absorber el costo',
        reputationChange: 0,
        moneyChange: -4000,
        satisfactionChange: 0,
        consequence: 'El presupuesto se ajusto pero sin impacto visible para estudiantes.',
      },
      {
        text: 'Trasladar costo a las familias',
        reputationChange: -3,
        moneyChange: 0,
        satisfactionChange: -4,
        consequence: 'Los padres estan molestos por los aumentos. Reclamos al consejo directivo.',
      },
    ],
  },
  // NEW: Acuerdo de patrocinio
  {
    title: 'Oferta de patrocinio deportivo',
    description:
      'Una empresa local ofrece patrocinar el equipo deportivo de la escuela a cambio de publicidad en los uniformes y eventos.',
    emoji: '🏷️',
    impact: 'neutral',
    category: 'financial',
    condition: (s) => s.sportsAreaEnabled,
    minWeek: 6,
    options: [
      {
        text: 'Aceptar el patrocinio completo',
        reputationChange: 2,
        moneyChange: 6000,
        satisfactionChange: 3,
        consequence: 'El patrocinio inyecta $6,000. Los uniformes lucen profesionales.',
      },
      {
        text: 'Negociar solo eventos especiales',
        reputationChange: 1,
        moneyChange: 2500,
        satisfactionChange: 2,
        consequence: 'Acuerdo moderado. La empresa participa solo en torneos.',
      },
      {
        text: 'Rechazar por principios',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 1,
        consequence: 'Algunos padres aplauden la decision, otros creen que fue una oportunidad perdida.',
      },
    ],
  },
  // NEW: Venta de articulos escolares
  {
    title: 'Propuesta de tienda escolar',
    description:
      'Un emprendedor ofrece instalar una pequena tienda dentro de la escuela que venda articulos escolares, snacks y uniformes. Ofrece un 15% de las ganancias.',
    emoji: '🏪',
    impact: 'neutral',
    category: 'financial',
    options: [
      {
        text: 'Aceptar la propuesta',
        reputationChange: 0,
        moneyChange: 2000,
        satisfactionChange: 3,
        consequence: 'La tienda es conveniente para todos y genera $2,000 mensuales.',
      },
      {
        text: 'Negociar mejor porcentaje',
        reputationChange: 1,
        moneyChange: 3000,
        satisfactionChange: 2,
        consequence: 'Se logro un 20% de ganancias. Mejor acuerdo para la escuela.',
      },
      {
        text: 'Rechazar',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -1,
        consequence: 'Oportunidad de ingreso extra desperdiciada.',
      },
    ],
  },
];

// ============================================
// STAFF EVENTS (8)
// ============================================
const staffEvents: LocalEventTemplate[] = [
  // ORIGINAL: Profesor reconocido por excelencia
  {
    title: 'Profesor reconocido por excelencia',
    description:
      'Un profesor de tu escuela ha sido reconocido a nivel regional por su dedicacion y excelencia en la ensenanza.',
    emoji: '🏅',
    impact: 'positive',
    isStaffEvent: true,
    category: 'staff',
    condition: (s) => s.teachers.filter((t: any) => t.hired).length > 0,
    options: [
      {
        text: 'Dar bono al profesor',
        reputationChange: 3,
        moneyChange: -3000,
        satisfactionChange: 3,
        consequence: 'El profesor esta muy agradecido y motivado.',
      },
      {
        text: 'Publicar en redes sociales',
        reputationChange: 4,
        moneyChange: 0,
        satisfactionChange: 2,
        consequence: 'La publicacion genero muchas interacciones positivas.',
      },
    ],
  },
  // ORIGINAL: Conserjes piden aumento de salario
  {
    title: 'Conserjes piden aumento de salario',
    description:
      'El personal de limpieza ha solicitado un aumento de salario debido al incremento en el costo de vida.',
    emoji: '🧹',
    impact: 'negative',
    isStaffEvent: true,
    category: 'staff',
    options: [
      {
        text: 'Dar el aumento',
        reputationChange: 2,
        moneyChange: -4000,
        satisfactionChange: 2,
        consequence: 'Los conserjes estan agradecidos y trabajan con mas entusiasmo.',
      },
      {
        text: 'Negociar un incremento menor',
        reputationChange: 0,
        moneyChange: -2000,
        satisfactionChange: 0,
        consequence: 'Se llego a un acuerdo intermedio.',
      },
      {
        text: 'Rechazar la solicitud',
        reputationChange: -3,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'Los conserjes estan desmotivados. La limpieza ha empeorado.',
      },
    ],
  },
  // ORIGINAL: Profesor solicita aumento
  {
    title: 'Profesor solicita aumento',
    description:
      'Un profesor experimentado solicita un aumento de salario amenazando con renunciar si no se le concede.',
    emoji: '👨‍🏫',
    impact: 'negative',
    isStaffEvent: true,
    category: 'staff',
    condition: (s) => s.teachers.filter((t: any) => t.hired).length > 0,
    options: [
      {
        text: 'Conceder el aumento',
        reputationChange: 1,
        moneyChange: -5000,
        satisfactionChange: 3,
        consequence: 'El profesor se quedo y esta motivado.',
      },
      {
        text: 'Negociar parcialmente',
        reputationChange: -1,
        moneyChange: -2500,
        satisfactionChange: 1,
        consequence: 'Se acepto un aumento menor.',
      },
      {
        text: 'Rechazar y buscar reemplazo',
        reputationChange: -4,
        moneyChange: -2000,
        satisfactionChange: -5,
        consequence: 'El profesor renuncio. Costara encontrar reemplazo.',
      },
    ],
  },
  // ORIGINAL: Profesor quiere renunciar
  {
    title: 'Profesor quiere renunciar',
    description:
      'Un profesor ha presentado su renuncia citing razones personales. Necesitas decidir que hacer.',
    emoji: '🚪',
    impact: 'negative',
    isStaffEvent: true,
    category: 'staff',
    condition: (s) => s.teachers.filter((t: any) => t.hired).length > 1,
    options: [
      {
        text: 'Ofrecer counteroffer',
        reputationChange: 2,
        moneyChange: -4000,
        satisfactionChange: 2,
        consequence: 'El profesor acepto quedarse con mejores condiciones.',
      },
      {
        text: 'Aceptar la renuncia',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'El profesor se fue. Necesitas contratar un reemplazo.',
      },
    ],
  },
  // NEW: Licencia por enfermedad de profesor
  {
    title: 'Licencia por enfermedad prolongada',
    description:
      'Uno de tus mejores profesores necesita una licencia medica de al menos 4 semanas. Necesitas cubrir sus clases durante su ausencia.',
    emoji: '🏥',
    impact: 'negative',
    isStaffEvent: true,
    category: 'staff',
    condition: (s) => s.activeTeachers >= 2,
    options: [
      {
        text: 'Contratar suplente temporal',
        reputationChange: 1,
        moneyChange: -3000,
        satisfactionChange: 2,
        consequence: 'El suplente mantuvo el nivel academico. Transicion sin problemas.',
      },
      {
        text: 'Redistribuir carga entre otros profesores',
        reputationChange: 0,
        moneyChange: -500,
        satisfactionChange: -2,
        consequence: 'Los profesores estan sobrecargados pero lograron cubrir las clases.',
      },
      {
        text: 'Solicitar al profesor que trabaje medio tiempo',
        reputationChange: -1,
        moneyChange: -1500,
        satisfactionChange: -1,
        consequence: 'El profesor no puede y su condicion empeoro. No fue buena idea.',
      },
    ],
  },
  // NEW: Capacitacion para docentes
  {
    title: 'Oportunidad de capacitacion docente',
    description:
      'Una universidad prestigiosa ofrece un programa de capacitacion en metodologias modernas para tus profesores. Es gratuita pero requiere que los profesores falten 2 dias.',
    emoji: '📖',
    impact: 'positive',
    isStaffEvent: true,
    category: 'staff',
    condition: (s) => s.activeTeachers >= 2,
    minWeek: 4,
    options: [
      {
        text: 'Enviar a todos los profesores',
        reputationChange: 3,
        moneyChange: -1500,
        satisfactionChange: 4,
        consequence: 'Los profesores volvieron con nuevas ideas. La calidad de ensenanza mejoro notablemente.',
      },
      {
        text: 'Enviar solo a los mejores',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 2,
        consequence: 'Los profesores capacitados comparten lo aprendido con los demas.',
      },
      {
        text: 'No interrumpir el calendario',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -1,
        consequence: 'Se perdio una buena oportunidad de mejora profesional.',
      },
    ],
  },
  // NEW: Nuevo aspirante a profesor
  {
    title: 'Candidato excepcional busca empleo',
    description:
      'Un profesor con maestria y 10 anos de experiencia ha solicitado un puesto en tu escuela. Su salario esperado es alto pero su perfil es excepcional.',
    emoji: '📄',
    impact: 'positive',
    isStaffEvent: true,
    category: 'staff',
    options: [
      {
        text: 'Contratar con salario completo',
        reputationChange: 4,
        moneyChange: -6000,
        satisfactionChange: 5,
        consequence: 'El nuevo profesor es extraordinario. Los estudiantes y padres estan encantados.',
      },
      {
        text: 'Negociar salario menor',
        reputationChange: 2,
        moneyChange: -4000,
        satisfactionChange: 3,
        consequence: 'El profesor acepto por la reputacion de la escuela. Buen balance.',
      },
      {
        text: 'No hay presupuesto',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -1,
        consequence: 'El profesor fue contratado por una escuela competidora.',
      },
    ],
  },
  // NEW: Demandas sindicales
  {
    title: 'Demandas del sindicato de trabajadores',
    description:
      'El sindicato del personal escolar ha presentado un pliego de peticiones que incluye mejoras en condiciones laborales, horarios y beneficios.',
    emoji: '⚖️',
    impact: 'negative',
    isStaffEvent: true,
    category: 'staff',
    minWeek: 8,
    options: [
      {
        text: 'Negociar y aceptar la mayoria',
        reputationChange: 3,
        moneyChange: -5000,
        satisfactionChange: 4,
        consequence: 'Se llego a un buen acuerdo. El personal esta satisfecho y productivo.',
      },
      {
        text: 'Negociar parcialmente',
        reputationChange: 1,
        moneyChange: -2500,
        satisfactionChange: 1,
        consequence: 'Se aceptaron algunas peticiones. El sindicato acepto pero no esta del todo feliz.',
      },
      {
        text: 'Rechazar el pliego',
        reputationChange: -5,
        moneyChange: 0,
        satisfactionChange: -6,
        consequence: 'Amenaza de paro. El clima laboral se deterioro significativamente.',
      },
    ],
  },
  // NEW: Evaluacion de desempeno docente
  {
    title: 'Evaluacion de desempeno docente',
    description:
      'Se han completado las evaluaciones de desempeno del personal docente. La mayoria tiene buenos resultados pero dos profesores tienen calificaciones bajas.',
    emoji: '📝',
    impact: 'neutral',
    isStaffEvent: true,
    category: 'staff',
    minWeek: 6,
    condition: (s) => s.activeTeachers >= 3,
    options: [
      {
        text: 'Plan de mejora con apoyo',
        reputationChange: 2,
        moneyChange: -2000,
        satisfactionChange: 3,
        consequence: 'Los profesores con bajo desempeno estan mejorando con mentoria.',
      },
      {
        text: 'Dar advertencia formal',
        reputationChange: 0,
        moneyChange: 0,
        satisfactionChange: 0,
        consequence: 'Los profesores advertidos se sintieron presionados. Resultados mixtos.',
      },
      {
        text: 'Premiar a los mejores, ignorar a los demas',
        reputationChange: 1,
        moneyChange: -1000,
        satisfactionChange: 1,
        consequence: 'Los mejores profesores estan motivados pero los demas se sienten ignorados.',
      },
    ],
  },
  // NEW: Actividad de team building
  {
    title: 'Actividad de team building para personal',
    description:
      'Un grupo de profesores propone organizar una jornada de team building para mejorar el ambiente laboral. Proponen una salida al aire libre.',
    emoji: '🏕️',
    impact: 'positive',
    isStaffEvent: true,
    category: 'staff',
    condition: (s) => s.activeTeachers >= 3,
    minWeek: 6,
    options: [
      {
        text: 'Organizar jornada completa',
        reputationChange: 2,
        moneyChange: -2000,
        satisfactionChange: 4,
        consequence: 'El team building fortalecio los lazos. El ambiente laboral mejoro notablemente.',
      },
      {
        text: 'Actividad breve en la escuela',
        reputationChange: 1,
        moneyChange: -300,
        satisfactionChange: 2,
        consequence: 'Fue divertido pero se quedaron con ganas de mas.',
      },
      {
        text: 'No es necesario',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'El personal siente que no se valora el ambiente laboral.',
      },
    ],
  },
];

// ============================================
// STUDENTS EVENTS (8)
// ============================================
const studentEvents: LocalEventTemplate[] = [
  // ORIGINAL: Estudiante con comportamiento problematico
  {
    title: 'Estudiante con comportamiento problematico',
    description:
      'Un estudiante ha estado causando problemas disciplinarios frecuentes. Los demas estudiantes se sienten afectados.',
    emoji: '😤',
    impact: 'negative',
    category: 'students',
    options: [
      {
        text: 'Expulsar al estudiante',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: 5,
        consequence: 'El ambiente mejoro, pero hay criticas por la decision.',
      },
      {
        text: 'Dar asesoramiento',
        reputationChange: 2,
        moneyChange: -1000,
        satisfactionChange: 2,
        consequence: 'El estudiante esta mostrando mejora gradual.',
      },
      {
        text: 'Hablar con los padres',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 1,
        consequence: 'Los padres se comprometieron a ayudar.',
      },
    ],
  },
  // ORIGINAL: Estudiantes se quejan de la comida
  {
    title: 'Estudiantes se quejan de la comida',
    description:
      'Varios estudiantes han reportado que la comida de la cafeteria no es de buena calidad. Algunos padres se han quejado.',
    emoji: '🍜',
    impact: 'negative',
    category: 'students',
    condition: (s) => s.cafeteriaBuilt,
    options: [
      {
        text: 'Mejorar la calidad',
        reputationChange: 2,
        moneyChange: -5000,
        satisfactionChange: 5,
        consequence: 'La comida mejoro notablemente. Estudiantes y padres felices.',
      },
      {
        text: 'Ignorar las quejas',
        reputationChange: -5,
        moneyChange: 0,
        satisfactionChange: -8,
        consequence: 'Las quejas continuan y han aumentado.',
      },
      {
        text: 'Cambiar proveedor',
        reputationChange: 1,
        moneyChange: -3000,
        satisfactionChange: 3,
        consequence: 'El nuevo proveedor ofrece mejor relacion calidad-precio.',
      },
    ],
  },
  // NEW: Logro estudiantil destacado
  {
    title: 'Estudiante descubre talento excepcional',
    description:
      'Una estudiante ha sido identificada con un talento excepcional para la musica. Ha sido invitada a audicionar para la orquesta juvenil nacional.',
    emoji: '🎻',
    impact: 'positive',
    category: 'students',
    options: [
      {
        text: 'Apoyar con transporte y preparacion',
        reputationChange: 3,
        moneyChange: -1500,
        satisfactionChange: 5,
        consequence: 'La estudiante paso la audicion! Orgullo para toda la escuela.',
      },
      {
        text: 'Dar permiso y apoyo moral',
        reputationChange: 2,
        moneyChange: -200,
        satisfactionChange: 3,
        consequence: 'La estudiante fue aceptada. La escuela celebra su logro.',
      },
    ],
  },
  // NEW: Solicitud de transferencia
  {
    title: 'Estudiante solicita transferencia',
    description:
      'Un estudiante destacado quiere transferirse a una escuela con beca deportiva. Su partida afectaria el rendimiento academico general.',
    emoji: '🚶',
    impact: 'negative',
    category: 'students',
    condition: (s) => s.activeStudents >= 5,
    options: [
      {
        text: 'Ofrecer beca interna para retenerlo',
        reputationChange: 2,
        moneyChange: -3000,
        satisfactionChange: 3,
        consequence: 'El estudiante acepto quedarse. Su presencia eleva el nivel academico.',
      },
      {
        text: 'Conversar con la familia',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 1,
        consequence: 'La familia aprecio la conversacion pero la decision final es del estudiante.',
      },
      {
        text: 'Aceptar la transferencia',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'Perdiste a uno de tus mejores estudiantes.',
      },
    ],
  },
  // NEW: Oleada de nuevas inscripciones
  {
    title: 'Oleada de nuevas inscripciones',
    description:
      'Debido a la buena reputacion de la escuela, han llegado 15 solicitudes de inscripcion nuevas. Necesitas decidir como manejar la demanda.',
    emoji: '📝',
    impact: 'positive',
    category: 'students',
    condition: (s) => s.reputation >= 55,
    minWeek: 6,
    options: [
      {
        text: 'Expandir capacidad temporalmente',
        reputationChange: 3,
        moneyChange: -4000,
        satisfactionChange: 5,
        consequence: 'Se aceptaron todos. La escuela bulle de energia. Ingresos aumentan.',
      },
      {
        text: 'Aceptar solo los mejores',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 2,
        consequence: 'Se aceptaron los mas calificados. Nivel academico se mantiene alto.',
      },
      {
        text: 'Crear lista de espera',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 0,
        consequence: 'Lista de espera creada. Algunos padres estan decepcionados.',
      },
    ],
  },
  // NEW: Estudiante abandona la escuela
  {
    title: 'Estudiante abandona la escuela',
    description:
      'Un estudiante ha dejado de asistir a clases sin explicacion. Sus padres no responden a las llamadas. Necesitas actuar.',
    emoji: '😣',
    impact: 'negative',
    category: 'students',
    condition: (s) => s.activeStudents >= 5,
    options: [
      {
        text: 'Visita domiciliaria',
        reputationChange: 3,
        moneyChange: -500,
        satisfactionChange: 2,
        consequence: 'Se descubrio un problema familiar. La escuela brindo apoyo y el estudiante regreso.',
      },
      {
        text: 'Reportar a las autoridades',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 0,
        consequence: 'Las autoridades educativas tomaron el caso. Esperando resultados.',
      },
      {
        text: 'Dar de baja automaticamente',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'El estudiante fue dado de baja. Podria haberse evitado con mayor seguimiento.',
      },
    ],
  },
  // NEW: Protesta estudiantil
  {
    title: 'Protesta estudiantil organizada',
    description:
      'Los estudiantes han organizado una protesta pacifica exigiendo mas actividades extracurriculares y mejor comida en la cafetería.',
    emoji: '✊',
    impact: 'neutral',
    category: 'students',
    minWeek: 8,
    condition: (s) => s.activeStudents >= 10,
    options: [
      {
        text: 'Escuchar y negociar',
        reputationChange: 4,
        moneyChange: -2500,
        satisfactionChange: 7,
        consequence: 'Se acordaron nuevas actividades y mejoras en la comida. Los estudiantes estan contentos.',
      },
      {
        text: 'Ignorar la protesta',
        reputationChange: -5,
        moneyChange: 0,
        satisfactionChange: -8,
        consequence: 'La protesta escala. Los medios locales se enteraron.',
      },
      {
        text: 'Prometer cambios sin compromiso',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: 1,
        consequence: 'Los estudiantes aceptaron pero estan escépticos. Pierden confianza.',
      },
    ],
  },
  // NEW: Orientacion para nuevos estudiantes
  {
    title: 'Programa de orientacion para nuevos alumnos',
    description:
      'Han llegado varios estudiantes nuevos y necesitan adaptarse. Los estudiantes antiguos proponen un programa de "padrinos" para integrarlos.',
    emoji: '🤗',
    impact: 'positive',
    category: 'students',
    options: [
      {
        text: 'Implementar programa completo',
        reputationChange: 3,
        moneyChange: -1500,
        satisfactionChange: 6,
        consequence: 'Los nuevos estudiantes se sintieron bienvenidos. El ambiente escolar mejoro.',
      },
      {
        text: 'Jornada de bienvenida',
        reputationChange: 1,
        moneyChange: -400,
        satisfactionChange: 3,
        consequence: 'La jornada fue bonita pero insuficiente para una integracion completa.',
      },
    ],
  },
  // NEW: Propuesta de excursion educativa
  {
    title: 'Propuesta de excursion educativa',
    description:
      'Los profesores de ciencias proponen una excursion a un museo interactivo y un laboratorio cientifico. Los estudiantes estan emocionados pero el costo es alto.',
    emoji: '🚌',
    impact: 'neutral',
    category: 'students',
    condition: (s) => s.activeStudents >= 8,
    options: [
      {
        text: 'Excursion para todos los estudiantes',
        reputationChange: 4,
        moneyChange: -5000,
        satisfactionChange: 8,
        consequence: 'La excursion fue increible. Los estudiantes aprendieron muchisimo.',
      },
      {
        text: 'Excursion solo para los mejores promedios',
        reputationChange: 1,
        moneyChange: -2000,
        satisfactionChange: 2,
        consequence: 'Los que fueron estan encantados, pero los que se quedaron se sienten excluidos.',
      },
      {
        text: 'Es muy caro para la escuela',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -4,
        consequence: 'Los estudiantes y profesores estan decepcionados.',
      },
    ],
  },
  // NEW: Estudiante con necesidades especiales
  {
    title: 'Estudiante con necesidades especiales se inscribe',
    description:
      'Un estudiante con discapacidad visual quiere inscribirse en la escuela. Se necesitan materiales adaptados y capacitacion para los profesores.',
    emoji: '👁️',
    impact: 'neutral',
    category: 'students',
    options: [
      {
        text: 'Preparar la escuela completamente',
        reputationChange: 5,
        moneyChange: -4000,
        satisfactionChange: 4,
        consequence: 'La escuela ahora es inclusiva. Un ejemplo para la comunidad educativa.',
      },
      {
        text: 'Adaptaciones basicas',
        reputationChange: 2,
        moneyChange: -1500,
        satisfactionChange: 2,
        consequence: 'Se hicieron adaptaciones esenciales pero faltan recursos especializados.',
      },
      {
        text: 'No se tiene la capacidad',
        reputationChange: -4,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'La familia esta devastada. La comunidad critica la falta de inclusion.',
      },
    ],
  },
];

// ============================================
// PARENTS EVENTS (6)
// ============================================
const parentEvents: LocalEventTemplate[] = [
  // ORIGINAL: Padre se queja del uniforme
  {
    title: 'Padre se queja del uniforme',
    description:
      'Un padre de familia ha presentado una queja formal sobre la politica de uniformes, argumentando que es demasiado costosa.',
    emoji: '👔',
    impact: 'neutral',
    category: 'parents',
    options: [
      {
        text: 'Revisar la politica',
        reputationChange: 1,
        moneyChange: -500,
        satisfactionChange: 3,
        consequence: 'Se aprobaron opciones mas economicas de uniforme.',
      },
      {
        text: 'Mantener la politica',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'El padre no esta satisfecho pero acepto la decision.',
      },
      {
        text: 'Ofrecer subsidio',
        reputationChange: 2,
        moneyChange: -2000,
        satisfactionChange: 4,
        consequence: 'Los padres de bajos recursos agradecen el apoyo.',
      },
    ],
  },
  // ORIGINAL: Solicitud de reunion de padres
  {
    title: 'Solicitud de reunion de padres',
    description:
      'Un grupo de padres ha solicitado una reunion para discutir el progreso academico de sus hijos.',
    emoji: '🤝',
    impact: 'neutral',
    category: 'parents',
    options: [
      {
        text: 'Organizar reunion formal',
        reputationChange: 3,
        moneyChange: -1000,
        satisfactionChange: 5,
        consequence: 'La reunion fortalecio la relacion escuela-padres.',
      },
      {
        text: 'Ofrecer reuniones individuales',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 4,
        consequence: 'Los padres aprecian la atencion personalizada.',
      },
      {
        text: 'Enviar reporte por escrito',
        reputationChange: 0,
        moneyChange: 0,
        satisfactionChange: 1,
        consequence: 'Los padres recibieron el reporte pero querian mas interaccion.',
      },
    ],
  },
  // ORIGINAL: Propuesta de actividad extracurricular (club de robotica)
  {
    title: 'Propuesta de actividad extracurricular',
    description:
      'Un grupo de padres ha propuesto crear un club de robtica como actividad extracurricular.',
    emoji: '🤖',
    impact: 'neutral',
    category: 'parents',
    options: [
      {
        text: 'Aprobar con presupuesto',
        reputationChange: 3,
        moneyChange: -4000,
        satisfactionChange: 6,
        consequence: 'El club de robotica es un exito rotundo!',
      },
      {
        text: 'Aprobar sin presupuesto',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 3,
        consequence: 'El club funciona con donaciones de los padres.',
      },
      {
        text: 'Rechazar por ahora',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'Los padres estan decepcionados.',
      },
    ],
  },
  // NEW: Reunion de la asociacion de padres
  {
    title: 'Asamblea general de la asociacion de padres',
    description:
      'La asociacion de padres de familia ha convocado una asamblea para presentar propuestas de mejora. Esperan tu asistencia y disposicion a escuchar.',
    emoji: '👨‍👩‍👧‍👦',
    impact: 'neutral',
    category: 'parents',
    minWeek: 8,
    options: [
      {
        text: 'Asistir y comprometerse',
        reputationChange: 4,
        moneyChange: -1000,
        satisfactionChange: 5,
        consequence: 'La participacion fue excelente. Se formaron comites de trabajo.',
      },
      {
        text: 'Enviar a un representante',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 2,
        consequence: 'Se cubrio lo basico pero los padres esperaban tu presencia.',
      },
      {
        text: 'No asistir por agenda ocupada',
        reputationChange: -3,
        moneyChange: 0,
        satisfactionChange: -4,
        consequence: 'Los padres se sienten ignorados. Malas impresiones en la comunidad.',
      },
    ],
  },
  // NEW: Queja de padre sobre metodo de ensenanza
  {
    title: 'Padre cuestiona metodo de ensenanza',
    description:
      'Un padre de familia esta insatisfecho con el metodo pedagogico utilizado en la clase de su hijo. Amenaza con llevar el caso al ministerio.',
    emoji: '⚠️',
    impact: 'negative',
    category: 'parents',
    options: [
      {
        text: 'Reunion personal y revision del metodo',
        reputationChange: 3,
        moneyChange: -500,
        satisfactionChange: 3,
        consequence: 'Se aclararon dudas. El padre reconocio el esfuerzo y quedo conforme.',
      },
      {
        text: 'Explicar la metodologia por escrito',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 1,
        consequence: 'El padre acepto la explicacion aunque sigue con reservas.',
      },
      {
        text: 'Defender al profesor sin cambios',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'El padre presento la queja ante el ministerio. Investigacion pendiente.',
      },
    ],
  },
  // NEW: Programa de voluntariado parental
  {
    title: 'Programa de voluntariado parental',
    description:
      'Un grupo de padres motivados quiere crear un programa de voluntariado para apoyar en la biblioteca, cafeteria y actividades escolares.',
    emoji: '🤲',
    impact: 'positive',
    category: 'parents',
    options: [
      {
        text: 'Crear programa con capacitacion',
        reputationChange: 3,
        moneyChange: -1000,
        satisfactionChange: 5,
        consequence: 'Los padres voluntarios son de gran ayuda. El ambiente escolar mejoro.',
      },
      {
        text: 'Aceptar ayuda espontanea',
        reputationChange: 2,
        moneyChange: -200,
        satisfactionChange: 3,
        consequence: 'Algunos padres ayudan ocasionalmente. Bueno pero desorganizado.',
      },
    ],
  },
  // NEW: Talleres para padres
  {
    title: 'Solicitud de talleres para padres',
    description:
      'Un grupo de padres solicita talleres sobre como apoyar a sus hijos en casa con las tareas y el desarrollo emocional.',
    emoji: '👩‍🏫',
    impact: 'positive',
    category: 'parents',
    minWeek: 5,
    options: [
      {
        text: 'Organizar ciclo de talleres',
        reputationChange: 3,
        moneyChange: -2000,
        satisfactionChange: 5,
        consequence: 'Los talleres fueron un exito. La participacion familiar en la educacion aumento.',
      },
      {
        text: 'Un taller piloto',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 3,
        consequence: 'El taller piloto funciono bien. Se planean mas para el proximo semestre.',
      },
    ],
  },
  // NEW: Puertas abiertas
  {
    title: 'Evento de puertas abiertas',
    description:
      'Se propone organizar un dia de puertas abiertas para que familias interesadas conozcan la escuela. Es una oportunidad de reclutamiento.',
    emoji: '🏫',
    impact: 'positive',
    category: 'parents',
    minWeek: 3,
    options: [
      {
        text: 'Evento grande con tours y presentaciones',
        reputationChange: 4,
        moneyChange: -3000,
        satisfactionChange: 5,
        consequence: 'Muchas familias visitaron. Se recibieron 20 solicitudes de inscripcion!',
      },
      {
        text: 'Visitas guiadas basicas',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 3,
        consequence: 'Buenas visitas. Se recibieron algunas solicitudes nuevas.',
      },
    ],
  },
  // NEW: Conferencia de padres y profesores
  {
    title: 'Jornada de conferencias padre-profesor',
    description:
      'Se acerca la fecha programada para las conferencias individuales padre-profesor. Algunos padres solicitan horarios extendidos para atender sus jornadas laborales.',
    emoji: '📅',
    impact: 'neutral',
    category: 'parents',
    options: [
      {
        text: 'Extender horarios y ofrecer virtual',
        reputationChange: 3,
        moneyChange: -800,
        satisfactionChange: 6,
        consequence: 'La asistencia fue del 95%. Todos los padres pudieron participar.',
      },
      {
        text: 'Mantener horario normal',
        reputationChange: 1,
        moneyChange: -200,
        satisfactionChange: 2,
        consequence: 'Asistencia del 60%. Algunos padres no pudieron asistir por trabajo.',
      },
    ],
  },
];

// ============================================
// SEASONAL EVENTS (6)
// ============================================
const seasonalEvents: LocalEventTemplate[] = [
  // NEW: Campamento de verano
  {
    title: 'Organizacion del campamento de verano',
    description:
      'Se avecinan las vacaciones de verano y hay interes en organizar un campamento educativo. Puede generar ingresos y mantener a los estudiantes activos.',
    emoji: '☀️',
    impact: 'positive',
    category: 'seasonal',
    minWeek: 20,
    options: [
      {
        text: 'Campamento completo con actividades diversas',
        reputationChange: 4,
        moneyChange: 3000,
        satisfactionChange: 7,
        consequence: 'El campamento fue fantastico. Beneficio neto y estudiantes felices.',
      },
      {
        text: 'Campamento basico de medio dia',
        reputationChange: 2,
        moneyChange: 1000,
        satisfactionChange: 4,
        consequence: 'Funciono bien. Los ninos disfrutaron las actividades.',
      },
      {
        text: 'No organizar este ano',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'Los padres tuvieron que buscar opciones externas. No ideal.',
      },
    ],
  },
  // NEW: Preparacion para temporada de huracanes
  {
    title: 'Preparacion para temporada de huracanes',
    description:
      'La temporada de huracanes se acerca y la escuela necesita reforzar sus medidas de seguridad. Los padres estan preocupados por la infraestructura.',
    emoji: '🌀',
    impact: 'negative',
    category: 'seasonal',
    minWeek: 14,
    options: [
      {
        text: 'Preparacion completa de emergencia',
        reputationChange: 3,
        moneyChange: -5000,
        satisfactionChange: 4,
        consequence: 'La escuela esta completamente preparada. Los padres estan tranquilos.',
      },
      {
        text: 'Medidas basicas de seguridad',
        reputationChange: 1,
        moneyChange: -1500,
        satisfactionChange: 2,
        consequence: 'Se cumplieron los minimos. Algunas areas necesitan mas atencion.',
      },
      {
        text: 'La escuela ha resistido antes',
        reputationChange: -3,
        moneyChange: 0,
        satisfactionChange: -4,
        consequence: 'Los padres estan muy preocupados. Algunos retiran a sus hijos preventivamente.',
      },
    ],
  },
  // NEW: Fiesta de navidad escolar
  {
    title: 'Fiesta de navidad escolar',
    description:
      'La comunidad escolar quiere celebrar la navidad con una fiesta que incluya presentaciones de los estudiantes, intercambio de regalos y una gran cena.',
    emoji: '🎄',
    impact: 'positive',
    category: 'seasonal',
    minWeek: 16,
    options: [
      {
        text: 'Gran fiesta con todo incluido',
        reputationChange: 4,
        moneyChange: -5000,
        satisfactionChange: 8,
        consequence: 'La fiesta fue magica. Momentos inolvidables para toda la comunidad.',
      },
      {
        text: 'Celebracion modesta y significativa',
        reputationChange: 2,
        moneyChange: -1500,
        satisfactionChange: 5,
        consequence: 'Fue sencilla pero llena de amor y sentido comunitario.',
      },
      {
        text: 'No hay presupuesto navideno',
        reputationChange: -3,
        moneyChange: 0,
        satisfactionChange: -5,
        consequence: 'Los estudiantes estan tristes. El espiritu navideno se perdio.',
      },
    ],
  },
  // NEW: Regreso a clases masivo
  {
    title: 'Regreso a clases - alta demanda',
    description:
      'El nuevo periodo escolar comienza y hay una demanda inusualmente alta de inscripciones. La escuela necesita preparar infraestructura y personal adicional.',
    emoji: '🎒',
    impact: 'positive',
    category: 'seasonal',
    minWeek: 1,
    options: [
      {
        text: 'Expandir capacidad rapidamente',
        reputationChange: 4,
        moneyChange: -8000,
        satisfactionChange: 6,
        consequence: 'Se recibieron todos los estudiantes. Excelente comienzo de ano escolar.',
      },
      {
        text: 'Aceptar dentro de la capacidad actual',
        reputationChange: 2,
        moneyChange: -1000,
        satisfactionChange: 3,
        consequence: 'Se lleno la capacidad. Lista de espera creada para proximos meses.',
      },
    ],
  },
  // NEW: Inundaciones por temporada de lluvias
  {
    title: 'Inundaciones por lluvias intensas',
    description:
      'Las lluvias torrenciales han inundado las areas bajas de la escuela incluyendo la entrada y el patio. Se necesita actuar para mantener la operatividad.',
    emoji: '🌊',
    impact: 'negative',
    category: 'seasonal',
    minWeek: 12,
    options: [
      {
        text: 'Sistema de drenaje de emergencia',
        reputationChange: 3,
        moneyChange: -7000,
        satisfactionChange: 3,
        consequence: 'El drenaje se instalo rapidamente. La escuela funciono normal tras la tormenta.',
      },
      {
        text: 'Clases reducidas temporalmente',
        reputationChange: -1,
        moneyChange: -1000,
        satisfactionChange: -2,
        consequence: 'Se perdieron dias de clase. Los padres estan preocupados.',
      },
      {
        text: 'Esperar a que pase',
        reputationChange: -4,
        moneyChange: -2000,
        satisfactionChange: -5,
        consequence: 'El dano fue mayor por la inaccion. Reparaciones mas costosas.',
      },
    ],
  },
  // NEW: Temporada de graduaciones
  {
    title: 'Temporada de graduaciones',
    description:
      'Se aproximan las graduaciones y las familias quieren una ceremonia memorable. Hay que organizar el evento, diplomas, decoracion y celebracion.',
    emoji: '🎓',
    impact: 'positive',
    category: 'seasonal',
    minWeek: 18,
    condition: (s) => s.activeStudents >= 5,
    options: [
      {
        text: 'Ceremonia grande y elegante',
        reputationChange: 5,
        moneyChange: -6000,
        satisfactionChange: 8,
        consequence: 'La ceremonia fue perfecta. Emocion, orgullo y celebracion para todos.',
      },
      {
        text: 'Ceremonia significativa pero modesta',
        reputationChange: 3,
        moneyChange: -2000,
        satisfactionChange: 5,
        consequence: 'Ceremonia intima pero hermosa. Los graduados y familias quedaron contentos.',
      },
      {
        text: 'Ceremonia minima',
        reputationChange: 1,
        moneyChange: -500,
        satisfactionChange: 2,
        consequence: 'Cumplio el requisito pero dejo mucho que desear.',
      },
    ],
  },
];

// ============================================
// ORIGINAL INSPECTION EVENTS (2)
// ============================================
const inspectionEvents: LocalEventTemplate[] = [
  // ORIGINAL: Inspeccion del Ministerio
  {
    title: 'Inspeccion del Ministerio',
    description:
      'El Ministerio de Educacion ha anunciado una inspeccion sorpresa para verificar las condiciones de la escuela.',
    emoji: '📋',
    impact: 'negative',
    isInspection: true,
    category: 'staff',
    options: [
      {
        text: 'Prepararse a fondo',
        reputationChange: 3,
        moneyChange: -3000,
        satisfactionChange: 1,
        consequence: 'La inspeccion fue aprobada con excelencia!',
      },
      {
        text: 'Prepararse rapidamente',
        reputationChange: 1,
        moneyChange: -1000,
        satisfactionChange: 0,
        consequence: 'La inspeccion fue aprobada con observaciones menores.',
      },
      {
        text: 'Ignorar la advertencia',
        reputationChange: -8,
        moneyChange: -5000,
        satisfactionChange: -5,
        consequence: 'La inspeccion encontro multiples violaciones. Multa impuesta.',
      },
    ],
  },
  // ORIGINAL: Inspeccion sorpresa de seguridad
  {
    title: 'Inspeccion sorpresa de seguridad',
    description:
      'Una inspeccion de seguridad inesperada esta evaluando las instalaciones de la escuela.',
    emoji: '🔍',
    impact: 'negative',
    isInspection: true,
    category: 'staff',
    options: [
      {
        text: 'Colaborar plenamente',
        reputationChange: 2,
        moneyChange: -1500,
        satisfactionChange: 1,
        consequence: 'La inspeccion salio bien. Recomendaciones menores.',
      },
      {
        text: 'Intentar retrasarla',
        reputationChange: -5,
        moneyChange: -2000,
        satisfactionChange: -3,
        consequence: 'La inspeccion se realizo de todos modos y encontro problemas.',
      },
    ],
  },
];

// ORIGINAL NEUTRAL EVENTS
const originalNeutralEvents: LocalEventTemplate[] = [
  // ORIGINAL: Simulacro de incendio
  {
    title: 'Simulacro de incendio',
    description:
      'Las autoridades requieren que se realice un simulacro de incendio. Hay que organizarlo.',
    emoji: '🚨',
    impact: 'neutral',
    category: 'infrastructure',
    options: [
      {
        text: 'Simulacro completo',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 2,
        consequence: 'El simulacro fue un exito y los estudiantes aprendieron procedimientos.',
      },
      {
        text: 'Simulacro basico',
        reputationChange: 0,
        moneyChange: -100,
        satisfactionChange: 0,
        consequence: 'Se cumplio el minimo requerido.',
      },
    ],
  },
  // ORIGINAL: Dia deportivo exitoso
  {
    title: 'Dia deportivo exitoso',
    description:
      'El dia deportivo escolar fue un gran exito. Padres y estudiantes disfrutaron de las actividades.',
    emoji: '⚽',
    impact: 'positive',
    category: 'social',
    condition: (s) => s.sportsAreaEnabled,
    options: [
      {
        text: 'Hacerlo mensual',
        reputationChange: 3,
        moneyChange: -1500,
        satisfactionChange: 6,
        consequence: 'Los estudiantes esperan con ansias el proximo evento.',
      },
      {
        text: 'Mantenerlo anual',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 3,
        consequence: 'El evento anual sigue siendo un momento especial.',
      },
    ],
  },
];

// ============================================
// NEW STAFF EVENTS (10) - Support staff systems
// ============================================
const newStaffEvents: LocalEventTemplate[] = [
  // NEW: Staff requesting raise
  {
    title: 'Personal de apoyo solicita aumento',
    description:
      'El personal de apoyo (psicologos, enfermeras, jardineros) ha presentado una peticion formal de aumento salarial argumentando sobrecarga de trabajo.',
    emoji: '💼',
    impact: 'negative',
    category: 'staff',
    isStaffEvent: true,
    condition: (s) => s.staff && s.staff.length > 0,
    options: [
      {
        text: 'Conceder aumento del 15%',
        reputationChange: 2,
        moneyChange: -3000,
        satisfactionChange: 4,
        consequence: 'El personal de apoyo agradece el gesto. La motivacion y el rendimiento mejoran.',
      },
      {
        text: 'Negociar un aumento modesto del 5%',
        reputationChange: 1,
        moneyChange: -1000,
        satisfactionChange: 1,
        consequence: 'Se llego a un acuerdo. No estan del todo conformes pero aceptan.',
      },
      {
        text: 'Rechazar la solicitud',
        reputationChange: -3,
        moneyChange: 0,
        satisfactionChange: -4,
        consequence: 'El personal esta desmotivado. La calidad del servicio de apoyo disminuye.',
      },
    ],
  },
  // NEW: Staff member quits
  {
    title: 'Empleado renuncia por baja moral',
    description:
      'Un miembro del personal de apoyo ha decidido renunciar citing insatisfaccion con las condiciones laborales y la falta de reconocimiento.',
    emoji: '🚪',
    impact: 'negative',
    category: 'staff',
    isStaffEvent: true,
    condition: (s) => s.staff && s.staff.length > 1,
    options: [
      {
        text: 'Ofrecer mejora de condiciones',
        reputationChange: 1,
        moneyChange: -2500,
        satisfactionChange: 2,
        consequence: 'El empleado acepto quedarse con mejores condiciones. Otros tambien se sintieron valorados.',
      },
      {
        text: 'Aceptar la renuncia con dignidad',
        reputationChange: 0,
        moneyChange: -500,
        satisfactionChange: -2,
        consequence: 'El empleado se fue. Necesitas buscar un reemplazo rapidamente.',
      },
      {
        text: 'Conocer las causas y mejorar',
        reputationChange: 2,
        moneyChange: -1500,
        satisfactionChange: 3,
        consequence: 'Se identificaron problemas reales. Se implementaron mejoras para todo el personal.',
      },
    ],
  },
  // NEW: Security incident
  {
    title: 'Incidente de seguridad en la escuela',
    description:
      'Se ha reportado un intento de ingreso de personas ajenas a la escuela. El vigilante de seguridad logro detener la situacion, pero se necesita reforzar las medidas.',
    emoji: '🛡️',
    impact: 'negative',
    category: 'staff',
    isStaffEvent: true,
    condition: (s) => s.staff && s.staff.length > 0,
    options: [
      {
        text: 'Instalar sistema de camaras y mejor control',
        reputationChange: 3,
        moneyChange: -5000,
        satisfactionChange: 4,
        consequence: 'El sistema de seguridad ahora es robusto. Los padres estan tranquilos.',
      },
      {
        text: 'Contratar vigilante adicional',
        reputationChange: 2,
        moneyChange: -2000,
        satisfactionChange: 3,
        consequence: 'Con dos vigilantes la seguridad mejoro notablemente.',
      },
      {
        text: 'Solo mejorar protocolos sin gastar',
        reputationChange: 0,
        moneyChange: -200,
        satisfactionChange: 1,
        consequence: 'Se actualizaron protocolos pero la vulnerabilidad persiste.',
      },
    ],
  },
  // NEW: Nurse handles emergency
  {
    title: 'Emergencia medica estudiantil',
    description:
      'Un estudiante ha sufrido una caida grave durante el recreo. La enfermera de la escuela atendio la emergencia con profesionalismo. Se necesita equipamiento adicional.',
    emoji: '🏥',
    impact: 'neutral',
    category: 'staff',
    isStaffEvent: true,
    condition: (s) => s.staff && s.staff.length > 0,
    options: [
      {
        text: 'Equipo medico completo para enfermeria',
        reputationChange: 3,
        moneyChange: -3500,
        satisfactionChange: 5,
        consequence: 'La enfermeria ahora esta equipada para cualquier emergencia. Los padres estan tranquilos.',
      },
      {
        text: 'Equipo basico de primeros auxilios',
        reputationChange: 1,
        moneyChange: -800,
        satisfactionChange: 2,
        consequence: 'Se mejoraron los suministros basicos pero sigue sin ser suficiente.',
      },
      {
        text: 'Reconocer a la enfermera sin gastar en equipo',
        reputationChange: 1,
        moneyChange: -200,
        satisfactionChange: 1,
        consequence: 'La enfermera fue reconocida pero el equipamiento sigue siendo insuficiente.',
      },
    ],
  },
  // NEW: Psychologist detects bullying
  {
    title: 'Psicologo detecta caso de acoso escolar',
    description:
      'La psicologa de la escuela ha identificado un caso grave de acoso escolar entre estudiantes. Necesita recursos para implementar un programa anti-acoso.',
    emoji: '🧠',
    impact: 'negative',
    category: 'staff',
    isStaffEvent: true,
    condition: (s) => s.staff && s.staff.length > 0 && s.activeStudents > 5,
    options: [
      {
        text: 'Programa integral anti-acoso',
        reputationChange: 4,
        moneyChange: -3000,
        satisfactionChange: 5,
        consequence: 'El programa fue exitoso. Se detectaron y resolvieron varios casos. Ambiente escolar mejoro.',
      },
      {
        text: 'Intervencion individual con los involucrados',
        reputationChange: 2,
        moneyChange: -800,
        satisfactionChange: 2,
        consequence: 'Se resolvio el caso particular pero la medida fue reactiva, no preventiva.',
      },
      {
        text: 'Dejar que los profesores lo manejen',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'Los profesores no estan capacitados para esto. El problema persiste y empeora.',
      },
    ],
  },
  // NEW: Gardener creates beautiful garden
  {
    title: 'Jardinero transforma los jardines',
    description:
      'El jardinero de la escuela ha propuesto crear un jardin botanico educativo con plantas nativas. La propuesta es ambitiosa pero mejoraria el ambiente escolar.',
    emoji: '🌻',
    impact: 'positive',
    category: 'staff',
    isStaffEvent: true,
    condition: (s) => s.staff && s.staff.length > 0,
    options: [
      {
        text: 'Proyecto completo con invernadero',
        reputationChange: 5,
        moneyChange: -4000,
        satisfactionChange: 6,
        consequence: 'El jardin es espectacular. Atrae visitantes y mejora la reputacion de la escuela.',
      },
      {
        text: 'Jardin modesto con plantas locales',
        reputationChange: 3,
        moneyChange: -1200,
        satisfactionChange: 4,
        consequence: 'Los jardines lucen hermosos. Los estudiantes disfrutan del espacio verde.',
      },
      {
        text: 'Mantenimiento basico sin cambios',
        reputationChange: 0,
        moneyChange: -300,
        satisfactionChange: 1,
        consequence: 'El jardinero mantiene lo existente pero no hay mejora visible.',
      },
    ],
  },
  // NEW: Janitor finds treasure
  {
    title: 'Conserje encuentra objeto valioso',
    description:
      'Durante una limpieza profunda, el conserje encontro una caja antigua con objetos de valor escondida detras de un armario viejo. El contenido podria venderse.',
    emoji: '✨',
    impact: 'positive',
    category: 'staff',
    isStaffEvent: true,
    condition: (s) => s.staff && s.staff.length > 0,
    options: [
      {
        text: 'Vender los objetos para la escuela',
        reputationChange: 0,
        moneyChange: 4000,
        satisfactionChange: 1,
        consequence: 'Se recaudaron $4,000 para mejoras escolares. Buen hallazgo!',
      },
      {
        text: 'Donar al museo local (buena prensa)',
        reputationChange: 4,
        moneyChange: 0,
        satisfactionChange: 3,
        consequence: 'La donacion genero excelente publicidad. La escuela aparecio en las noticias.',
      },
      {
        text: 'Recompensar al conserje con una parte',
        reputationChange: 2,
        moneyChange: 2500,
        satisfactionChange: 5,
        consequence: 'El conserje esta emocionado. Todo el personal aprecia el gesto de generosidad.',
      },
    ],
  },
  // NEW: Staff appreciation day
  {
    title: 'Propuesta de dia de agradecimiento al personal',
    description:
      'El consejo estudiantil quiere organizar un dia especial para agradecer a todo el personal no docente de la escuela: conserjes, vigilantes, cocineros y jardineros.',
    emoji: '🎉',
    impact: 'positive',
    category: 'staff',
    isStaffEvent: true,
    condition: (s) => s.staff && s.staff.length > 0,
    options: [
      {
        text: 'Evento grande con regalos y comida',
        reputationChange: 3,
        moneyChange: -2500,
        satisfactionChange: 6,
        consequence: 'El personal no docente se siente valorado por primera vez. La motivacion se dispara.',
      },
      {
        text: 'Ceremonia sencilla con diplomas',
        reputationChange: 2,
        moneyChange: -400,
        satisfactionChange: 4,
        consequence: 'Los diplomas y palabras de agradecimiento fueron suficientes para emocionarlos.',
      },
    ],
  },
  // NEW: New staff applicant
  {
    title: 'Candidato cualificado busca empleo',
    description:
      'Un profesional con experiencia en psicologia educativa ha solicitado un puesto en la escuela. Su perfil es excepcional pero el salario esperado es alto.',
    emoji: '📋',
    impact: 'positive',
    category: 'staff',
    isStaffEvent: true,
    condition: (s) => s.staff && s.staff.length > 0,
    options: [
      {
        text: 'Contratar con salario completo',
        reputationChange: 4,
        moneyChange: -4500,
        satisfactionChange: 5,
        consequence: 'La nueva psicologa es extraordinaria. Los estudiantes y padres estan encantados.',
      },
      {
        text: 'Negociar condiciones intermedias',
        reputationChange: 2,
        moneyChange: -3000,
        satisfactionChange: 3,
        consequence: 'El profesional acepto por el proyecto educativo. Buen equilibrio.',
      },
      {
        text: 'No hay presupuesto disponible',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -1,
        consequence: 'El profesional fue contratado por una escuela competidora.',
      },
    ],
  },
  // NEW: Staff conflict between departments
  {
    title: 'Conflicto entre departamentos',
    description:
      'Ha surgido un conflicto entre el personal de limpieza y el de cocina por el uso de espacios comunes. La tension esta afectando el ambiente de trabajo.',
    emoji: '⚡',
    impact: 'negative',
    category: 'staff',
    isStaffEvent: true,
    condition: (s) => s.staff && s.staff.length > 2,
    options: [
      {
        text: 'Reunion de mediacion con todos',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 3,
        consequence: 'Se llego a un acuerdo. Cada departamento tiene horarios definidos para usar los espacios.',
      },
      {
        text: 'Reorganizar los espacios fisicos',
        reputationChange: 2,
        moneyChange: -2000,
        satisfactionChange: 4,
        consequence: 'La redistribucion de espacios elimino el conflicto. Todos estan conformes.',
      },
      {
        text: 'Ignorar el conflicto',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -4,
        consequence: 'La tension escalo. Hay quejas de ambos lados y el servicio se resiente.',
      },
    ],
  },
];

// ============================================
// ALUMNI EVENTS (5)
// ============================================
const alumniEvents: LocalEventTemplate[] = [
  // NEW: Successful alumni visits
  {
    title: 'Ex-alumno exitoso visita la escuela',
    description:
      'Un ex-alumno que ahora es un empresario reconocido ha visitado la escuela para dar una charla motivacional a los estudiantes. La visita genero mucho entusiasmo.',
    emoji: '🌟',
    impact: 'positive',
    category: 'alumni',
    condition: (s) => s.alumni && s.alumni.length > 0,
    options: [
      {
        text: 'Organizar charla y almuerzo con los estudiantes',
        reputationChange: 5,
        moneyChange: -1500,
        satisfactionChange: 7,
        consequence: 'La visita fue inspiradora. Los estudiantes quedaron motivados y la prensa local cubrio el evento.',
      },
      {
        text: 'Charla breve sin gastos extra',
        reputationChange: 3,
        moneyChange: -200,
        satisfactionChange: 4,
        consequence: 'La charla motivo a muchos estudiantes. El ex-alumno prometio volver.',
      },
    ],
  },
  // NEW: Alumni donates money
  {
    title: 'Ex-alumno dona dinero para becas',
    description:
      'Un grupo de ex-alumnos ha creado un fondo de becas para estudiantes con bajo recursos. Quieren que la escuela administre los fondos y seleccione a los beneficiarios.',
    emoji: '💎',
    impact: 'positive',
    category: 'alumni',
    condition: (s) => s.alumni && s.alumni.length > 0,
    options: [
      {
        text: 'Crear comite de becas con ex-alumnos',
        reputationChange: 5,
        moneyChange: 8000,
        satisfactionChange: 6,
        consequence: 'Se otorgaron becas a 5 estudiantes. La comunidad celebra esta iniciativa.',
      },
      {
        text: 'Administrar los fondos internamente',
        reputationChange: 3,
        moneyChange: 8000,
        satisfactionChange: 4,
        consequence: 'Las becas se otorgaron pero sin la participacion de los ex-alumnos como esperaban.',
      },
      {
        text: 'Solicitar mas detalles antes de aceptar',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 1,
        consequence: 'Los ex-alumnos estan dispuestos a esperar pero esperan una pronta respuesta.',
      },
    ],
  },
  // NEW: Alumni offers internships
  {
    title: 'Ex-alumnos ofrecen pasantias profesionales',
    description:
      'Varios ex-alumnos exitosos han ofrecido crear un programa de pasantias para los estudiantes de ultimo ano en sus empresas.',
    emoji: '🏢',
    impact: 'positive',
    category: 'alumni',
    condition: (s) => s.alumni && s.alumni.length > 0 && s.activeStudents > 10,
    options: [
      {
        text: 'Programa de pasantias completo',
        reputationChange: 5,
        moneyChange: -2000,
        satisfactionChange: 7,
        consequence: '10 estudiantes obtuvieron pasantias. Esto eleva enormemente el perfil de la escuela.',
      },
      {
        text: 'Pasantias durante vacaciones unicamente',
        reputationChange: 3,
        moneyChange: -500,
        satisfactionChange: 4,
        consequence: 'Las pasantias funcionan bien en vacaciones. Menos interferencia con clases.',
      },
    ],
  },
  // NEW: Alumni writes bad review
  {
    title: 'Ex-alumno escribe resena negativa en linea',
    description:
      'Un ex-alumno insatisfecho ha publicado una resena negativa sobre la escuela en redes sociales, criticando la calidad educativa que recibio.',
    emoji: '📱',
    impact: 'negative',
    category: 'alumni',
    condition: (s) => s.alumni && s.alumni.length > 0,
    options: [
      {
        text: 'Contactar al ex-alumno y dialogar',
        reputationChange: 2,
        moneyChange: -300,
        satisfactionChange: 2,
        consequence: 'Se logro un dialogo. El ex-alumno acepto actualizar su resena tras entender las mejoras realizadas.',
      },
      {
        text: 'Publicar respuesta institucional',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 1,
        consequence: 'La respuesta profesional mitigation el dano. Algunos padres apreciaron la transparencia.',
      },
      {
        text: 'Ignorar la resena',
        reputationChange: -3,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'La resena se volvio viral. Varias familias retiraron a sus hijos.',
      },
    ],
  },
  // NEW: Alumni reunion event
  {
    title: 'Propuesta de reunion de ex-alumnos',
    description:
      'Un grupo de ex-alumnos quiere organizar una reunion de antiguos alumnos para celebrar los 20 anos de la escuela. Quieren usar las instalaciones.',
    emoji: '🎓',
    impact: 'neutral',
    category: 'alumni',
    condition: (s) => s.alumni && s.alumni.length > 0,
    minWeek: 12,
    options: [
      {
        text: 'Gran reunion con cena y actividades',
        reputationChange: 4,
        moneyChange: -3500,
        satisfactionChange: 5,
        consequence: 'La reunion fue un exito. Se recaudaron fondos y se fortalecion los lazos con ex-alumnos.',
      },
      {
        text: 'Reunion sencilla en el patio',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 3,
        consequence: 'Los ex-alumnos disfrutaron recordar su paso por la escuela.',
      },
      {
        text: 'No hay disponibilidad de espacios',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'Los ex-alumnos estan decepcionados. La relacion con egresados se enfria.',
      },
    ],
  },
];

// ============================================
// NEW INSPECTION EVENTS (5)
// ============================================
const newInspectionEvents: LocalEventTemplate[] = [
  // NEW: Health department visit
  {
    title: 'Visita del departamento de salud',
    description:
      'El departamento de salud realizara una inspeccion sanitaria de la cafeteria y los servicios higienicos de la escuela.',
    emoji: '🩺',
    impact: 'negative',
    category: 'inspection',
    isInspection: true,
    condition: (s) => s.currentWeek > 8,
    options: [
      {
        text: 'Limpieza y desinfeccion profunda previa',
        reputationChange: 3,
        moneyChange: -3000,
        satisfactionChange: 3,
        consequence: 'La inspeccion fue aprobada con excelencia. Mencion especial por la higiene.',
      },
      {
        text: 'Limpieza basica y esperar',
        reputationChange: 0,
        moneyChange: -500,
        satisfactionChange: 0,
        consequence: 'Aprobada con observaciones menores. Se requiere mejora en algunos puntos.',
      },
      {
        text: 'No tomar medidas especiales',
        reputationChange: -5,
        moneyChange: -2000,
        satisfactionChange: -4,
        consequence: 'Se encontraron multiples violaciones sanitarias. Multa y orden de correccion.',
      },
    ],
  },
  // NEW: Fire safety inspection
  {
    title: 'Inspeccion de seguridad contra incendios',
    description:
      'El cuerpo de bomberos ha programado una inspeccion de seguridad contra incendios. Verificaran extintores, salidas de emergencia y senalizacion.',
    emoji: '🚒',
    impact: 'negative',
    category: 'inspection',
    isInspection: true,
    condition: (s) => s.currentWeek > 8,
    options: [
      {
        text: 'Actualizar todo el equipo de seguridad',
        reputationChange: 3,
        moneyChange: -4000,
        satisfactionChange: 3,
        consequence: 'La escuela cumple con todas las normativas. Certificado de seguridad renovado.',
      },
      {
        text: 'Revisar y reparar lo minimo necesario',
        reputationChange: 1,
        moneyChange: -1500,
        satisfactionChange: 1,
        consequence: 'Se aprobo con algunas observaciones que deben corregirse en 30 dias.',
      },
      {
        text: 'Confiar en lo que ya se tiene',
        reputationChange: -4,
        moneyChange: -3000,
        satisfactionChange: -3,
        consequence: 'Varios extintores estaban vencidos y las salidas no estaban senalizadas. Cierre temporal ordenado.',
      },
    ],
  },
  // NEW: Accreditation review
  {
    title: 'Revision de acreditacion institucional',
    description:
      'La agencia de acreditacion educativa ha iniciado el proceso de revision para renovar la acreditacion de la escuela. El proceso dura varias semanas.',
    emoji: '📜',
    impact: 'neutral',
    category: 'inspection',
    isInspection: true,
    condition: (s) => s.currentWeek > 10,
    options: [
      {
        text: 'Preparacion completa con consultor',
        reputationChange: 4,
        moneyChange: -5000,
        satisfactionChange: 4,
        consequence: 'La acreditacion fue renovada con distinccion. Gran prestigio para la escuela.',
      },
      {
        text: 'Preparacion interna con el equipo actual',
        reputationChange: 2,
        moneyChange: -1000,
        satisfactionChange: 2,
        consequence: 'La acreditacion fue renovada satisfactoriamente aunque sin distincion.',
      },
      {
        text: 'No dedicar recursos extra',
        reputationChange: -3,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'La acreditacion fue denegada. Se debe repetir el proceso en 6 meses con costo adicional.',
      },
    ],
  },
  // NEW: Building safety audit
  {
    title: 'Auditoria de seguridad estructural',
    description:
      'La secretaria de infraestructura ordena una auditoria estructural del edificio escolar tras reportes de vibraciones en una zona cercana.',
    emoji: '🏗️',
    impact: 'neutral',
    category: 'inspection',
    isInspection: true,
    condition: (s) => s.currentWeek > 8,
    options: [
      {
        text: 'Contratar ingeniero especializado',
        reputationChange: 3,
        moneyChange: -4000,
        satisfactionChange: 3,
        consequence: 'El informe confirma que el edificio esta seguro. Los padres estan tranquilos.',
      },
      {
        text: 'Solicitar inspeccion gratuita municipal',
        reputationChange: 1,
        moneyChange: -200,
        satisfactionChange: 1,
        consequence: 'La inspeccion basica no encontro problemas mayores pero recomienda revision profesional.',
      },
    ],
  },
  // NEW: Environmental compliance check
  {
    title: 'Verificacion de cumplimiento ambiental',
    description:
      'La autoridad ambiental realizara una verificacion del manejo de residuos y uso de recursos en la escuela. Deben cumplir normativas ecológicas.',
    emoji: '🌿',
    impact: 'neutral',
    category: 'inspection',
    isInspection: true,
    condition: (s) => s.currentWeek > 12,
    options: [
      {
        text: 'Programa ambiental integral',
        reputationChange: 4,
        moneyChange: -3000,
        satisfactionChange: 5,
        consequence: 'La escuela fue reconocida como modelo ambiental. Los estudiantes lideran proyectos ecologicos.',
      },
      {
        text: 'Cumplimiento basico de normas',
        reputationChange: 1,
        moneyChange: -800,
        satisfactionChange: 1,
        consequence: 'Se cumplieron los requisitos minimos. Sin multas pero sin reconocimientos.',
      },
      {
        text: 'No se tomaron medidas ambientales',
        reputationChange: -3,
        moneyChange: -2000,
        satisfactionChange: -2,
        consequence: 'Se impuso multa por manejo inadecuado de residuos. La imagen publica sufrio.',
      },
    ],
  },
];

// ============================================
// FESTIVAL EVENTS (5)
// ============================================
const festivalEvents: LocalEventTemplate[] = [
  // NEW: Science fair preparation
  {
    title: 'Preparacion de la feria de ciencias escolar',
    description:
      'Se acerca la feria de ciencias anual y los estudiantes quieren presentar proyectos innovadores. Necesitan materiales, espacio de exhibicion y jueces.',
    emoji: '🔬',
    impact: 'positive',
    category: 'festival',
    condition: (s) => s.activeStudents > 10,
    minWeek: 6,
    options: [
      {
        text: 'Feria completa con premios y jueces invitados',
        reputationChange: 4,
        moneyChange: -3500,
        satisfactionChange: 7,
        consequence: 'La feria fue espectacular. Tres proyectos fueron seleccionados para la feria regional.',
      },
      {
        text: 'Feria modesta en los pasillos',
        reputationChange: 2,
        moneyChange: -800,
        satisfactionChange: 4,
        consequence: 'Los estudiantes disfrutaron presentar sus proyectos. Buena participacion.',
      },
      {
        text: 'Posponer para el proximo semestre',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'Los estudiantes decepcionados perdieron el interes en los proyectos.',
      },
    ],
  },
  // NEW: Sports day organization
  {
    title: 'Organizacion del dia deportivo escolar',
    description:
      'El dia deportivo es el evento mas esperado del ano. Los estudiantes quieren competir en multiples disciplinas y las familias esperan un gran espectaculo.',
    emoji: '🏅',
    impact: 'positive',
    category: 'festival',
    condition: (s) => s.activeStudents > 10,
    minWeek: 8,
    options: [
      {
        text: 'Dia deportivo con medallas y premios',
        reputationChange: 5,
        moneyChange: -4000,
        satisfactionChange: 8,
        consequence: 'El evento fue increible. Competencias emocionantes y premios para todos.',
      },
      {
        text: 'Actividades deportivas sin premios',
        reputationChange: 3,
        moneyChange: -1000,
        satisfactionChange: 5,
        consequence: 'Los estudiantes disfrutaron las competencias aunque sin la emocion de los premios.',
      },
    ],
  },
  // NEW: Cultural festival
  {
    title: 'Gran festival cultural escolar',
    description:
      'La comunidad educativa quiere celebrar un festival cultural con musica, danza, teatro y gastronomia. Es la oportunidad de mostrar el talento de los estudiantes.',
    emoji: '🎭',
    impact: 'positive',
    category: 'festival',
    condition: (s) => s.activeStudents > 10,
    minWeek: 10,
    options: [
      {
        text: 'Festival grande con escenario profesional',
        reputationChange: 5,
        moneyChange: -5000,
        satisfactionChange: 8,
        consequence: 'El festival fue memorable. La escuela fue noticia y recibio felicitaciones del ministerio.',
      },
      {
        text: 'Festival en el patio con creatividad',
        reputationChange: 3,
        moneyChange: -1500,
        satisfactionChange: 6,
        consequence: 'El festival intimo fue encantador. La creatividad de los estudiantes brilló.',
      },
      {
        text: 'No hay presupuesto este ano',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -5,
        consequence: 'Los estudiantes y padres estan muy decepcionados. Tradicion interrumpida.',
      },
    ],
  },
  // NEW: Art exhibition
  {
    title: 'Exposicion de arte anual',
    description:
      'Los estudiantes de arte han preparado obras todo el semestre para la exposicion anual. Necesitan marcos, iluminacion y un espacio de exhibicion digno.',
    emoji: '🖼️',
    impact: 'positive',
    category: 'festival',
    condition: (s) => s.activeStudents > 10,
    options: [
      {
        text: 'Exposicion profesional con catalogo',
        reputationChange: 4,
        moneyChange: -3000,
        satisfactionChange: 7,
        consequence: 'Las obras fueron vendidas y se recaudo dinero para el programa de arte. Exito total.',
      },
      {
        text: 'Exposicion en pasillos y sala de profesores',
        reputationChange: 2,
        moneyChange: -400,
        satisfactionChange: 4,
        consequence: 'Los estudiantes estan orgullosos de sus obras. Buena participacion de la comunidad.',
      },
    ],
  },
  // NEW: Graduation ceremony
  {
    title: 'Ceremonia de graduacion',
    description:
      'Los estudiantes de ultimo ano se graduan y las familias esperan una ceremonia inolvidable. Necesitas organizar el evento con diplomas, discursos y celebracion.',
    emoji: '🎓',
    impact: 'positive',
    category: 'festival',
    condition: (s) => s.activeStudents > 10,
    minWeek: 16,
    options: [
      {
        text: 'Ceremonia elegante con orquesta y cena',
        reputationChange: 5,
        moneyChange: -7000,
        satisfactionChange: 9,
        consequence: 'La ceremonia fue perfecta. Emocion, orgullo y lagrimas de felicidad para todos.',
      },
      {
        text: 'Ceremonia significativa y emotiva',
        reputationChange: 3,
        moneyChange: -2500,
        satisfactionChange: 7,
        consequence: 'Ceremonia intima pero hermosa. Los graduados y familias quedaron muy contentos.',
      },
      {
        text: 'Ceremonia minima por presupuesto',
        reputationChange: 0,
        moneyChange: -500,
        satisfactionChange: 2,
        consequence: 'Cumplio el requisito pero dejo mucho que desear. Los graduados estan tristes.',
      },
    ],
  },
];

// ============================================
// NEW PARENT EVENTS (5)
// ============================================
const newParentEvents: LocalEventTemplate[] = [
  // NEW: PTA meeting request
  {
    title: 'Solicitud de reunion de la APA',
    description:
      'La Asociacion de Padres de Familia solicita una reunion urgente para discutir varias inquietudes sobre la gestion escolar y proponer mejoras.',
    emoji: '🏛️',
    impact: 'neutral',
    category: 'parent',
    condition: (s) => s.activeStudents > 5 && s.currentWeek > 4,
    minWeek: 6,
    options: [
      {
        text: 'Reunion formal con agenda completa',
        reputationChange: 3,
        moneyChange: -800,
        satisfactionChange: 5,
        consequence: 'La reunion fue productiva. Se formaron comites de trabajo y los padres se sienten escuchados.',
      },
      {
        text: 'Enviar representante del equipo directivo',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 2,
        consequence: 'Se cubrio lo basico pero los padres esperaban tu presencia personal.',
      },
      {
        text: 'Posponer indefinidamente',
        reputationChange: -4,
        moneyChange: 0,
        satisfactionChange: -5,
        consequence: 'Los padres estan furiosos. Amenazan con protestas publicas y retiro de estudiantes.',
      },
    ],
  },
  // NEW: Parent complaint about food
  {
    title: 'Padre denuncia mala calidad del almuerzo',
    description:
      'Un padre de familia ha presentado una denuncia formal ante las autoridades educativas por la supuesta mala calidad de los alimentos del almuerzo escolar.',
    emoji: '🍽️',
    impact: 'negative',
    category: 'parent',
    condition: (s) => s.activeStudents > 5 && s.currentWeek > 4,
    options: [
      {
        text: 'Auditoria de calidad alimentaria',
        reputationChange: 3,
        moneyChange: -2000,
        satisfactionChange: 5,
        consequence: 'La auditoria mejoro la calidad. El padre retiro la denuncia y felicito la gestion.',
      },
      {
        text: 'Invitar al padre a ver la cocina',
        reputationChange: 1,
        moneyChange: -200,
        satisfactionChange: 2,
        consequence: 'El padre se tranquilizo tras ver las instalaciones. Hubo malentendidos.',
      },
      {
        text: 'Ignorar la denuncia',
        reputationChange: -5,
        moneyChange: -3000,
        satisfactionChange: -6,
        consequence: 'Las autoridades abrieron investigacion. La escuela fue multada y el caso salio en prensa.',
      },
    ],
  },
  // NEW: Parent volunteer program
  {
    title: 'Programa de voluntariado de padres',
    description:
      'Un grupo de padres profesionales quiere ofrecer talleres gratuitos a los estudiantes: carpinteria, programacion, cocina y fotografia.',
    emoji: '🤝',
    impact: 'positive',
    category: 'parent',
    condition: (s) => s.activeStudents > 5 && s.currentWeek > 4,
    options: [
      {
        text: 'Programa completo con horario fijo',
        reputationChange: 4,
        moneyChange: -1000,
        satisfactionChange: 7,
        consequence: 'Los talleres son un exito. Los estudiantes aprenden habilidades practicas valiosas.',
      },
      {
        text: 'Talleres esporadicos los sabados',
        reputationChange: 2,
        moneyChange: -200,
        satisfactionChange: 4,
        consequence: 'Los talleres sabatinos funcionan bien. Buena participacion aunque limitada.',
      },
      {
        text: 'No hay espacio en el horario escolar',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'Los padres se sienten rechazados. Oportunidad de enriquecimiento perdida.',
      },
    ],
  },
  // NEW: Parent fundraising event
  {
    title: 'Padres organizan evento benéfico',
    description:
      'La asociacion de padres quiere organizar una carrera solidaria y una feria de comida para recaudar fondos para nuevos equipos de computo.',
    emoji: '🏃',
    impact: 'positive',
    category: 'parent',
    condition: (s) => s.activeStudents > 5 && s.currentWeek > 4,
    options: [
      {
        text: 'Apoyo total con logistica de la escuela',
        reputationChange: 4,
        moneyChange: -1500,
        satisfactionChange: 6,
        consequence: 'El evento recaudo $8,000. Se compraron 15 computadoras nuevas para el laboratorio.',
      },
      {
        text: 'Ceder espacio sin apoyo adicional',
        reputationChange: 2,
        moneyChange: -200,
        satisfactionChange: 3,
        consequence: 'Los padres lo hicieron solos. Se recaudo una cantidad modesta pero positiva.',
      },
    ],
  },
  // NEW: Angry parent confrontation
  {
    title: 'Confrontacion de padre enfurecido',
    description:
      'Un padre de familia ha llegado a la escuela muy enojado exigiendo explicaciones por una supuesta agresion a su hijo. La situacion es tensa y otros padres observan.',
    emoji: '😤',
    impact: 'negative',
    category: 'parent',
    condition: (s) => s.activeStudents > 5 && s.currentWeek > 4,
    options: [
      {
        text: 'Escuchar con empatia e investigar',
        reputationChange: 3,
        moneyChange: -500,
        satisfactionChange: 3,
        consequence: 'Se descubrio un malentendido. El padre pidio disculpas y se restablecio la confianza.',
      },
      {
        text: 'Llamar a seguridad',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'La situacion escalo. El padre presento queja formal ante las autoridades.',
      },
      {
        text: 'Explicar la version de la escuela',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 1,
        consequence: 'Se escucho la queja pero la falta de investigacion dejo dudas.',
      },
    ],
  },
];

// ============================================
// NEW SEASONAL EVENTS (5)
// ============================================
const newSeasonalEvents: LocalEventTemplate[] = [
  // NEW: Summer school program
  {
    title: 'Oportunidad de escuela de verano',
    description:
      'El ministerio de educacion ofrece fondos para programas de verano. Puedes organizar cursos de refuerzo, deportes y actividades recreativas.',
    emoji: '☀️',
    impact: 'positive',
    category: 'seasonal',
    condition: (s) => s.activeStudents > 5,
    minWeek: 20,
    options: [
      {
        text: 'Programa completo de verano con todo incluido',
        reputationChange: 4,
        moneyChange: 3000,
        satisfactionChange: 7,
        consequence: 'El programa de verano fue fantastico. Beneficio financiero y estudiantes felices.',
      },
      {
        text: 'Cursos de refuerzo academicos unicamente',
        reputationChange: 2,
        moneyChange: 1000,
        satisfactionChange: 3,
        consequence: 'Los cursos de refuerzo ayudaron a los estudiantes con dificultades.',
      },
      {
        text: 'Cerrar durante el verano',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -2,
        consequence: 'Los padres tuvieron que buscar opciones externas. Algunos prefirieron otras escuelas.',
      },
    ],
  },
  // NEW: Winter holiday celebration
  {
    title: 'Celebracion de fin de ano',
    description:
      'La comunidad escolar quiere celebrar el cierre del ano con una gran fiesta que incluya presentaciones, premios y actividades para toda la familia.',
    emoji: '❄️',
    impact: 'positive',
    category: 'seasonal',
    minWeek: 18,
    options: [
      {
        text: 'Gran fiesta de cierre con premios y espectaculo',
        reputationChange: 4,
        moneyChange: -4500,
        satisfactionChange: 8,
        consequence: 'La celebracion fue magica. Momentos inolvidables que fortalecieron la comunidad escolar.',
      },
      {
        text: 'Celebracion modesta y significativa',
        reputationChange: 2,
        moneyChange: -1500,
        satisfactionChange: 5,
        consequence: 'Fue sencilla pero llena de sentido comunitario. Todos se fueron contentos.',
      },
    ],
  },
  // NEW: Back-to-school enrollment rush
  {
    title: 'Avalancha de inscripciones de inicio de ano',
    description:
      'La buena reputacion de la escuela ha generado una demanda excepcional de inscripciones. Tienes mas solicitudes que cupos disponibles.',
    emoji: '🎒',
    impact: 'positive',
    category: 'seasonal',
    condition: (s) => s.reputation > 50,
    options: [
      {
        text: 'Expandir capacidad con aulas temporales',
        reputationChange: 4,
        moneyChange: -5000,
        satisfactionChange: 5,
        consequence: 'Se aceptaron todos los estudiantes. Ingresos aumentan y la escuela crece.',
      },
      {
        text: 'Seleccionar los mejores candidatos',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 2,
        consequence: 'El nivel academico se mantiene alto pero algunos padres quedaron decepcionados.',
      },
      {
        text: 'Crear lista de espera ordenada',
        reputationChange: 1,
        moneyChange: 0,
        satisfactionChange: 0,
        consequence: 'La lista de espera genero interes pero tambien frustracion en las familias.',
      },
    ],
  },
  // NEW: Spring cleaning event
  {
    title: 'Jornada de limpieza primaveral',
    description:
      'Un grupo de padres y estudiantes propone organizar una jornada de limpieza y embellecimiento de la escuela al inicio de la primavera.',
    emoji: '🧹',
    impact: 'positive',
    category: 'seasonal',
    options: [
      {
        text: 'Jornada con materiales y comida para participantes',
        reputationChange: 3,
        moneyChange: -1500,
        satisfactionChange: 6,
        consequence: 'La escuela brilla. La comunidad trabajo junta y el espiritu escolar se fortalecio.',
      },
      {
        text: 'Jornada con lo que haya disponible',
        reputationChange: 2,
        moneyChange: -200,
        satisfactionChange: 4,
        consequence: 'Buena limpieza. La participacion fue alta aunque faltaron materiales.',
      },
    ],
  },
  // NEW: Rainy season flooding
  {
    title: 'Inundacion por temporada de lluvias',
    description:
      'Las lluvias extremas han inundado el primer piso de la escuela. Los salones, laboratorio y cocina estan bajo el agua. Se necesita actuar de inmediato.',
    emoji: '🌊',
    impact: 'negative',
    category: 'seasonal',
    minWeek: 14,
    options: [
      {
        text: 'Reparacion completa y sistema de prevencion',
        reputationChange: 3,
        moneyChange: -8000,
        satisfactionChange: 3,
        consequence: 'Se reparo todo y se instalo un sistema de drenaje que evitara futuras inundaciones.',
      },
      {
        text: 'Bombeo de agua y limpieza de emergencia',
        reputationChange: 1,
        moneyChange: -3000,
        satisfactionChange: 1,
        consequence: 'Se recupero la operatividad pero sin resolver la causa del problema.',
      },
      {
        text: 'Cerrar hasta que baje el agua',
        reputationChange: -4,
        moneyChange: -2000,
        satisfactionChange: -5,
        consequence: 'Se perdieron 2 semanas de clases. Los danos empeoraron con el tiempo.',
      },
    ],
  },
];

// ============================================
// DECORATION EVENTS (5)
// ============================================
const decorationEvents: LocalEventTemplate[] = [
  // NEW: Student mural proposal
  {
    title: 'Propuesta de mural estudiantil',
    description:
      'Los estudiantes de arte quieren pintar un mural en la pared principal de la escuela. El proyecto necesitaria pintura, andamios y permisos especiales.',
    emoji: '🎨',
    impact: 'positive',
    category: 'decoration',
    options: [
      {
        text: 'Mural profesional con artista invitado',
        reputationChange: 5,
        moneyChange: -3500,
        satisfactionChange: 7,
        consequence: 'El mural es una obra de arte. La escuela se convirtio en referencia cultural del barrio.',
      },
      {
        text: 'Mural pintado por los estudiantes',
        reputationChange: 3,
        moneyChange: -800,
        satisfactionChange: 6,
        consequence: 'Los estudiantes pintaron un mural hermoso. Se sienten orgullosos de su escuela.',
      },
      {
        text: 'No se permite pintar las paredes',
        reputationChange: -1,
        moneyChange: 0,
        satisfactionChange: -3,
        consequence: 'Los estudiantes estan decepcionados. El muro sigue gris y sin vida.',
      },
    ],
  },
  // NEW: Garden improvement project
  {
    title: 'Proyecto de mejora de jardines',
    description:
      'Un grupo de padres landscape designers quiere remodelar los jardines de la escuela como donacion, pero necesitan que la escuela compre las plantas.',
    emoji: '🌺',
    impact: 'positive',
    category: 'decoration',
    options: [
      {
        text: 'Jardin completo con area de lectura al aire libre',
        reputationChange: 4,
        moneyChange: -2500,
        satisfactionChange: 6,
        consequence: 'Los nuevos jardines son impresionantes. El area de lectura al aire libre es un exito.',
      },
      {
        text: 'Jardin mejorado con plantas basicas',
        reputationChange: 2,
        moneyChange: -800,
        satisfactionChange: 3,
        consequence: 'Los jardines lucen mucho mejor. Los estudiantes disfrutan del espacio verde.',
      },
      {
        text: 'No hay presupuesto para plantas',
        reputationChange: 0,
        moneyChange: 0,
        satisfactionChange: -1,
        consequence: 'Los padres retiraron su oferta. Oportunidad perdida de mejora gratuita.',
      },
    ],
  },
  // NEW: Playground equipment breaks
  {
    title: 'Equipo de juego se rompe peligrosamente',
    description:
      'Los toboganes y columpios del area de recreo se han roto. Un estudiante casi sufre un accidente grave. Se necesita reemplazo urgente.',
    emoji: '⚠️',
    impact: 'negative',
    category: 'decoration',
    options: [
      {
        text: 'Equipo nuevo de alta calidad y seguro',
        reputationChange: 3,
        moneyChange: -6000,
        satisfactionChange: 6,
        consequence: 'Los nuevos juegos son seguros, modernos y divertidos. Los ninos estan encantados.',
      },
      {
        text: 'Reparacion basica de los equipos existentes',
        reputationChange: 0,
        moneyChange: -2000,
        satisfactionChange: 1,
        consequence: 'Se repararon los equipos criticos pero siguen siendo viejos y poco atractivos.',
      },
      {
        text: 'Cerrar el area de juegos',
        reputationChange: -3,
        moneyChange: -200,
        satisfactionChange: -5,
        consequence: 'Los ninos no tienen donde jugar. Se aburren y se portan mal en clase.',
      },
    ],
  },
  // NEW: New sports equipment needed
  {
    title: 'Se necesita equipo deportivo nuevo',
    description:
      'Los estudiantes quieren participar en mas deportes pero el equipo actual esta desgastado y no alcanza para todos. Balones, redes y uniformes necesitan reemplazo.',
    emoji: '⚽',
    impact: 'neutral',
    category: 'decoration',
    options: [
      {
        text: 'Equipo completo para 5 deportes',
        reputationChange: 3,
        moneyChange: -4000,
        satisfactionChange: 6,
        consequence: 'Los estudiantes practican futbol, baloncesto, voleibol, atletismo y natacion. Excelente programa deportivo.',
      },
      {
        text: 'Equipo basico para futbol y baloncesto',
        reputationChange: 1,
        moneyChange: -1200,
        satisfactionChange: 3,
        consequence: 'Al menos los deportes principales tienen buen equipo.',
      },
      {
        text: 'Los estudiantes deben traer su propio equipo',
        reputationChange: -2,
        moneyChange: 0,
        satisfactionChange: -4,
        consequence: 'Los estudiantes de bajos recursos no pueden participar. Desigualdad visible.',
      },
    ],
  },
  // NEW: Library expansion request
  {
    title: 'Solicitud de expansion de biblioteca',
    description:
      'La biblioteca actual es pequena y no tiene suficientes libros ni espacios de lectura. Los estudiantes y profesores solicitan una expansion urgente.',
    emoji: '📚',
    impact: 'neutral',
    category: 'decoration',
    options: [
      {
        text: 'Expansion completa con zona digital',
        reputationChange: 5,
        moneyChange: -7000,
        satisfactionChange: 7,
        consequence: 'La nueva biblioteca es increible. Con computadoras, zona de lectura y miles de libros nuevos.',
      },
      {
        text: 'Adaptar un salon como biblioteca ampliada',
        reputationChange: 2,
        moneyChange: -2500,
        satisfactionChange: 4,
        consequence: 'El espacio ampliado es funcional aunque no tan impresionante. Los estudiantes lo agradecen.',
      },
      {
        text: 'Comprar mas libros sin ampliar espacio',
        reputationChange: 1,
        moneyChange: -1500,
        satisfactionChange: 2,
        consequence: 'Hay mas libros pero el espacio sigue siendo insuficiente para albergar a todos.',
      },
    ],
  },
];

// ============================================
// TUTORIAL EVENTS (3) - First 4 weeks only
// ============================================
const tutorialEvents: LocalEventTemplate[] = [
  // NEW: Welcome new director tip
  {
    title: 'Consejo: Bienvenido, nuevo director',
    description:
      'Un consejo experimentado te recomienda que lo primero que debes hacer es evaluar las necesidades de la escuela y trazar un plan a corto plazo.',
    emoji: '💡',
    impact: 'positive',
    category: 'tutorial',
    condition: (s) => s.currentWeek <= 4 && s.tutorialStep > 0,
    maxRepeats: 1,
    options: [
      {
        text: 'Crear un plan estrategico',
        reputationChange: 2,
        moneyChange: -500,
        satisfactionChange: 3,
        consequence: 'Tu plan estrategico te da claridad sobre las prioridades. Buen comienzo como director.',
      },
      {
        text: 'Ir resolviendo sobre la marcha',
        reputationChange: 0,
        moneyChange: 0,
        satisfactionChange: 1,
        consequence: 'Sin plan puede ser caotico, pero cada problema resuelto te ensena algo.',
      },
    ],
  },
  // NEW: First teacher hiring tip
  {
    title: 'Consejo: Tu primer profesor',
    description:
      'El personal docente es el corazon de la escuela. Un buen profesor puede transformar la experiencia educativa de decenas de estudiantes. Elige con cuidado.',
    emoji: '👨‍🏫',
    impact: 'positive',
    category: 'tutorial',
    condition: (s) => s.currentWeek <= 4 && s.tutorialStep > 0,
    maxRepeats: 1,
    options: [
      {
        text: 'Invertir tiempo en contratar bien',
        reputationChange: 3,
        moneyChange: 0,
        satisfactionChange: 2,
        consequence: 'Tomarte el tiempo para elegir al mejor candidato dara frutos a largo plazo.',
      },
      {
        text: 'Contratar rapido para cubrir necesidades',
        reputationChange: 0,
        moneyChange: 0,
        satisfactionChange: 0,
        consequence: 'Tener alguien al frente del aula es mejor que nada, pero la calidad puede variar.',
      },
    ],
  },
  // NEW: First student enrollment tip
  {
    title: 'Consejo: Primeros estudiantes',
    description:
      'Los primeros estudiantes son fundamentales. Su experiencia positiva traera mas inscripciones por recomendacion. Cuida cada detalle.',
    emoji: '🎒',
    impact: 'positive',
    category: 'tutorial',
    condition: (s) => s.currentWeek <= 4 && s.tutorialStep > 0,
    maxRepeats: 1,
    options: [
      {
        text: 'Preparar una experiencia de bienvenida especial',
        reputationChange: 3,
        moneyChange: -1000,
        satisfactionChange: 5,
        consequence: 'Los primeros estudiantes y sus familias quedan encantados. Las recomendaciones no tardan en llegar.',
      },
      {
        text: 'Proceso de inscripcion estandar',
        reputationChange: 1,
        moneyChange: -100,
        satisfactionChange: 2,
        consequence: 'Funcional pero sin dar una impresion memorable. Suficiente para empezar.',
      },
    ],
  },
];

// ============================================
// CAMPAIGN/CHAPTER EVENTS (3)
// ============================================
const campaignEvents: LocalEventTemplate[] = [
  // NEW: Chapter challenge - reach X students
  {
    title: 'Reto de capitulo: Meta de estudiantes',
    description:
      'El desafio actual de tu capitulo es alcanzar una meta de matricula. Necesitas atraer mas estudiantes para desbloquear el siguiente nivel.',
    emoji: '🎯',
    impact: 'neutral',
    category: 'campaign',
    condition: (s) => s.campaignChapter > 0,
    options: [
      {
        text: 'Campana agresiva de marketing escolar',
        reputationChange: 3,
        moneyChange: -3000,
        satisfactionChange: 4,
        consequence: 'La campana genero muchas inscripciones. Estás más cerca de la meta del capitulo.',
      },
      {
        text: 'Ofrecer becas de ingreso parcial',
        reputationChange: 2,
        moneyChange: -2000,
        satisfactionChange: 3,
        consequence: 'Las becas atrajeron familias que no podrian pagar la colegiatura completa.',
      },
      {
        text: 'Esperar a que lleguen naturalmente',
        reputationChange: 0,
        moneyChange: 0,
        satisfactionChange: -1,
        consequence: 'Sin accion activa, el crecimiento es lento. El reto del capitulo se complica.',
      },
    ],
  },
  // NEW: Chapter challenge - reach X reputation
  {
    title: 'Reto de capitulo: Mejorar reputacion',
    description:
      'Para avanzar al siguiente capitulo necesitas mejorar significativamente la reputacion de la escuela. La comunidad debe hablar bien de ti.',
    emoji: '⭐',
    impact: 'neutral',
    category: 'campaign',
    condition: (s) => s.campaignChapter > 0,
    options: [
      {
        text: 'Invertir en eventos comunitarios',
        reputationChange: 5,
        moneyChange: -4000,
        satisfactionChange: 4,
        consequence: 'Los eventos comunitarios generaron excelente publicidad. La reputacion sube notablemente.',
      },
      {
        text: 'Mejorar servicios internos visibles',
        reputationChange: 3,
        moneyChange: -2500,
        satisfactionChange: 5,
        consequence: 'Mejores servicios generan comentarios positivos de padres y estudiantes.',
      },
      {
        text: 'No gastar en imagen publica',
        reputationChange: 0,
        moneyChange: 0,
        satisfactionChange: 0,
        consequence: 'Sin esfuerzos de imagen, la reputacion crece muy lentamente.',
      },
    ],
  },
  // NEW: Chapter challenge - survive financial crisis
  {
    title: 'Reto de capitulo: Crisis financiera',
    description:
      'Una crisis financiera inesperada amenaza la estabilidad de la escuela. Debes tomar decisiones dificiles para sobrevivir y avanzar en el capitulo.',
    emoji: '📈',
    impact: 'negative',
    category: 'campaign',
    condition: (s) => s.campaignChapter > 0,
    options: [
      {
        text: 'Plan de ahorro sin afectar calidad',
        reputationChange: 2,
        moneyChange: 1000,
        satisfactionChange: 2,
        consequence: 'Recortes inteligentes en areas no visibles. La calidad educativa se mantiene.',
      },
      {
        text: 'Solicitar credito educativo',
        reputationChange: 1,
        moneyChange: 5000,
        satisfactionChange: 1,
        consequence: 'El credito da respiro financiero pero habra que pagarlo con intereses.',
      },
      {
        text: 'Aumentar colegiatura drásticamente',
        reputationChange: -4,
        moneyChange: 3000,
        satisfactionChange: -5,
        consequence: 'El ingreso mejora pero la perdida de estudiantes sera grave a mediano plazo.',
      },
    ],
  },
];

// ============================================
// COMBINE ALL EVENTS
// ============================================
export const LOCAL_EVENTS: LocalEventTemplate[] = [
  ...academicEvents,
  ...socialEvents,
  ...infrastructureEvents,
  ...financialEvents,
  ...staffEvents,
  ...studentEvents,
  ...parentEvents,
  ...seasonalEvents,
  ...inspectionEvents,
  ...originalNeutralEvents,
  // NEW CATEGORY EVENTS
  ...newStaffEvents,
  ...alumniEvents,
  ...newInspectionEvents,
  ...festivalEvents,
  ...newParentEvents,
  ...newSeasonalEvents,
  ...decorationEvents,
  ...tutorialEvents,
  ...campaignEvents,
];

// ============================================
// EVENT FILTERING AND SELECTION
// ============================================

/**
 * Filter events that are eligible to fire based on game state.
 *
 * @param state        - Current Zustand store snapshot
 * @param usedEventIds - Set of event titles recently used (still on cooldown)
 * @param currentWeek  - The current game week
 * @param repeatCounts - Map of event title → number of times it has already fired
 * @returns Array of eligible LocalEventTemplate
 */
export function getEligibleEvents(
  state: any,
  usedEventIds: Set<string>,
  currentWeek: number,
  repeatCounts: Map<string, number> = new Map()
): LocalEventTemplate[] {
  return LOCAL_EVENTS.filter((event) => {
    // Condition check
    if (event.condition && !event.condition(state)) {
      return false;
    }

    // Minimum week check
    if (event.minWeek !== undefined && currentWeek < event.minWeek) {
      return false;
    }

    // Cooldown check — the title is used as the unique key
    if (usedEventIds.has(event.title)) {
      return false;
    }

    // Max repeats check
    const maxRepeats = event.maxRepeats ?? 3;
    const timesUsed = repeatCounts.get(event.title) ?? 0;
    if (timesUsed >= maxRepeats) {
      return false;
    }

    return true;
  });
}

/**
 * Pick a random event from the eligible pool with weighted probability
 * based on the school's current conditions.
 *
 * Weighting rules:
 * - If reputation < 30 → 60% negative, 20% neutral, 20% positive
 * - If reputation > 70 → 20% negative, 20% neutral, 60% positive
 * - Otherwise          → 25% negative, 40% neutral, 35% positive
 *
 * Also attempts to balance categories so no single category dominates.
 *
 * @param events - Array of eligible events
 * @param state  - Current game state (for weighting)
 * @returns A single LocalEventTemplate or null if empty
 */
export function getRandomWeightedEvent(
  events: LocalEventTemplate[],
  state?: any
): LocalEventTemplate | null {
  if (events.length === 0) return null;
  if (events.length === 1) return events[0];

  const reputation = state?.reputation ?? 50;

  // Determine impact weights
  let positiveW: number;
  let neutralW: number;
  let negativeW: number;

  if (reputation < 30) {
    negativeW = 0.6;
    neutralW = 0.2;
    positiveW = 0.2;
  } else if (reputation > 70) {
    negativeW = 0.2;
    neutralW = 0.2;
    positiveW = 0.6;
  } else {
    negativeW = 0.25;
    neutralW = 0.4;
    positiveW = 0.35;
  }

  // Build per-event weight: base weight = impact probability
  const weights = events.map((e) => {
    let w: number;
    if (e.impact === 'positive') w = positiveW;
    else if (e.impact === 'negative') w = negativeW;
    else w = neutralW;

    // Category balancing: reduce weight if too many events of the same
    // category are already in the pool. Count same-category siblings.
    const sameCategoryCount = events.filter(
      (other) => other.category === e.category
    ).length;
    const categoryDivisor = Math.ceil(sameCategoryCount / 4); // normalize
    w /= categoryDivisor;

    // Inspection events are rarer (only ~5% when eligible)
    if (e.isInspection) w *= 0.05;

    // Staff events are slightly rarer
    if (e.isStaffEvent && !e.isInspection) w *= 0.4;

    return w;
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) return events[Math.floor(Math.random() * events.length)];

  let roll = Math.random() * totalWeight;
  for (let i = 0; i < events.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return events[i];
  }

  return events[events.length - 1];
}

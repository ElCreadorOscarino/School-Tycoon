// News System for School Tycoon
// Self-contained module - no internal project imports

export interface NewsArticle {
  id: string;
  headline: string;
  content: string;
  category: 'sports' | 'academic' | 'social' | 'financial' | 'infrastructure' | 'crisis';
  emoji: string;
  week: number;
  impact: 'positive' | 'neutral' | 'negative';
  read: boolean;
}

// ─── Template pools ──────────────────────────────────────────────

export const NEWS_TEMPLATES = {
  positive: [
    { headline: '{schoolName} recibe premio a la excelencia educativa', content: 'La prestigiosa institución fue reconocida por su destacado desempeño académico y compromiso con la educación de calidad.' },
    { headline: 'Estudiantes de {schoolName} ganan olimpiada nacional', content: 'Un grupo de {studentCount} estudiantes destacados logró el primer lugar en la Olimpiada Nacional de Ciencias, poniendo en alto el nombre de la escuela.' },
    { headline: '{schoolName} supera las {studentCount} matrículas este semestre', content: 'La creciente demanda demuestra la confianza de las familias en el proyecto educativo de la institución.' },
    { headline: 'Nuevo programa de becas beneficia a familias de bajos recursos', content: 'Gracias a la gestión de {schoolName}, más de 50 estudiantes podrán continuar sus estudios con apoyo financiero completo.' },
    { headline: 'Profesores de {schoolName} reciben capacitación internacional', content: 'Un grupo de docentes participó en un programa de formación en pedagogía moderna, fortaleciendo la calidad educativa.' },
    { headline: 'Feria de ciencias de {schoolName} es la más grande del país', content: 'Más de {studentCount} visitantes disfrutaron de proyectos innovadores presentados por los estudiantes de la institución.' },
    { headline: '{schoolName} inaugura moderno laboratorio de computación', content: 'La nueva instalación cuenta con {studentCount} equipos de última generación, beneficiando a toda la comunidad estudiantil.' },
    { headline: 'Padres de familia elogian la disciplina en {schoolName}', content: 'En una encuesta realizada, el 95% de los padres expresó satisfacción con el ambiente escolar y la formación integral.' },
    { headline: '{schoolName} firma convenio con universidad prestigiosa', content: 'El acuerdo permitirá que los mejores estudiantes obtengan admisión directa y becas parciales en la universidad.' },
    { headline: 'Graduados de {schoolName} destacan en el sector profesional', content: 'Exalumnos de la institución ocupan posiciones de liderazgo en empresas nacionales e internacionales.' },
    { headline: 'Programa de lectura de {schoolName} rompe récord de participación', content: 'Más del 80% de los estudiantes participó activamente en el maratón de lectura anual, superando metas anteriores.' },
    { headline: '{schoolName} recibe donación de equipo deportivo', content: 'Una empresa local donó uniformes y balones para fortalecer los programas deportivos de la institución.' },
    { headline: 'Proyecto ambiental de {schoolName} gana premio ecológico', content: 'Los estudiantes implementaron un sistema de reciclaje y jardines verticales que fue reconocido a nivel nacional.' },
    { headline: 'Tasa de deserción en {schoolName} baja al mínimo histórico', content: 'Gracias a programas de acompañamiento y tutorías, la escuela mantiene a casi todos sus estudiantes hasta la graduación.' },
    { headline: '{schoolName} celebra exitosa jornada de puertas abiertas', content: 'Cientos de familias visitaron las instalaciones y expresaron su interés en formar parte de la comunidad educativa.' },
  ],
  negative: [
    { headline: 'Protestas en {schoolName} por condiciones de infraestructura', content: 'Estudiantes y padres exigen mejoras urgentes en las instalaciones que presentan deterioro avanzado.' },
    { headline: 'Huelga de profesores afecta clases en {schoolName}', content: 'El personal docente suspendió actividades reclamando mejores condiciones laborales y ajuste salarial.' },
    { headline: 'Denuncias de bullying preocupan a la comunidad de {schoolName}', content: 'Varios padres reportaron incidentes de acoso escolar que la administración prometió investigar.' },
    { headline: 'Resultados académicos de {schoolName} están por debajo del promedio', content: 'Las últimas evaluaciones estandarizadas revelan una caída preocupante en los indicadores de aprendizaje.' },
    { headline: 'Corte de energía deja sin clases a {studentCount} estudiantes', content: 'Un fallo eléctrico prolongado obligó a suspender las actividades durante toda la jornada escolar.' },
    { headline: 'Inundación afecta aulas de {schoolName} durante la tormenta', content: 'Las intensas lluvias provocaron daños en varias aulas y el área de la biblioteca, requiriendo reparaciones urgentes.' },
    { headline: 'Padres retiran a estudiantes de {schoolName} por insatisfacción', content: 'Algunas familias han decidido buscar alternativas educativas tras una serie de incidentes no resueltos.' },
    { headline: 'Auditoría revela irregularidades financieras en {schoolName}', content: 'Un informe externo detectó deficiencias en la gestión de fondos, generando preocupación entre los beneficiarios.' },
    { headline: 'Accidente en área deportiva de {schoolName} deja heridos', content: 'Un estudiante resultó herido durante una práctica deportiva debido a las deficientes condiciones de las instalaciones.' },
    { headline: '{schoolName} enfrenta crisis de matrícula por competencia', content: 'Otras instituciones en la zona han atraído a un número significativo de estudiantes que anteriormente asistían a la escuela.' },
  ],
  neutral: [
    { headline: '{schoolName} anuncia calendario escolar para el próximo período', content: 'La administración publicó las fechas importantes del próximo semestre, incluyendo exámenes, vacaciones y actividades especiales.' },
    { headline: 'Nuevos uniformes serán implementados en {schoolName}', content: 'A partir del próximo semestre, los estudiantes utilizarán un diseño actualizado que fue elegido por votación de la comunidad.' },
    { headline: '{schoolName} organiza campamento de verano para estudiantes', content: 'Las inscripciones están abiertas para el programa vacacional que incluye deportes, arte y actividades académicas recreativas.' },
    { headline: 'Reunión de padres de familia programada en {schoolName}', content: 'La próxima asamblea general abordará temas de presupuesto, mejoras infraestructurales y el plan académico del próximo ciclo.' },
    { headline: 'Mantenimiento programado en instalaciones de {schoolName}', content: 'Durante las próximas dos semanas se realizarán obras de mejoramiento en los baños y áreas comunes de la escuela.' },
    { headline: '{schoolName} participa en feria educativa regional', content: 'La institución presentará sus programas académicos y extracurriculares en el evento educativo más importante de la región.' },
    { headline: 'Estudiantes de {schoolName} realizan jornada de limpieza', content: 'Como parte del programa de educación ambiental, los estudiantes limpiaron las áreas verdes y los alrededores de la escuela.' },
    { headline: 'Nuevos libros llegan a la biblioteca de {schoolName}', content: 'La adquisición de más de 200 nuevos títulos enriquecerá el acervo bibliográfico disponible para los estudiantes.' },
    { headline: '{schoolName} ofrece talleres gratuitos para la comunidad', content: 'Adultos y jóvenes de la zona podrán participar en cursos de computación, manualidades y primeros auxilios.' },
    { headline: 'Consejo estudiantil de {schoolName} presenta propuestas', content: 'Los representantes estudiantiles entregaron un documento con sugerencias para mejorar la vida escolar y las actividades extracurriculares.' },
  ],
  sports: [
    { headline: 'Equipo de béisbol de {schoolName} avanza a semifinales', content: 'Los jugadores demostraron gran talento y trabajo en equipo, venciendo a su rival en un emocionante partido.' },
    { headline: 'Estudiante de {schoolName} rompe récord en atletismo', content: 'Con un tiempo impresionante en los 100 metros, el joven atleta se posiciona como uno de los mejores del país en su categoría.' },
    { headline: 'Campeonato de baloncesto escolar se celebra en {schoolName}', content: 'La institución fue elegida como sede del torneo intercolegial que reúne a los mejores equipos de la región.' },
    { headline: 'Equipo de voleibol femenino de {schoolName} logra campeonato', content: 'Las jugadoras mostraron determinación y habilidad, llevándose el trofeo tras un torneo muy competitivo.' },
    { headline: 'Maratón escolar en {schoolName} reúne a toda la comunidad', content: 'Más de 500 participantes corrieron la carrera de 5 km organizada por el departamento de educación física.' },
    { headline: 'Estudiantes de {schoolName} representarán al país en competencia internacional', content: 'Un seleccionado de deportistas viajará al extranjero para competir en disciplinas de atletismo y natación.' },
    { headline: 'Nuevo gimnasio de {schoolName} impulsa el talento deportivo', content: 'La moderna instalación permitirá entrenar a más estudiantes en diversas disciplinas con equipamiento profesional.' },
    { headline: 'Torneo de fútbol interaulas emociona a estudiantes de {schoolName}', content: 'La competencia entre grados generó un ambiente de sana rivalidad y espíritu deportivo en toda la escuela.' },
  ],
  academic: [
    { headline: 'Estudiantes de {schoolName} obtienen las mejores notas en pruebas nacionales', content: 'El 90% de los graduandos alcanzó niveles satisfactorios o avanzados en las evaluaciones estandarizadas.' },
    { headline: 'Proyecto de robótica de {schoolName} gana competencia regional', content: 'El equipo de jóvenes inventores construyó un robot capaz de resolver laberintos, superando a escuelas técnicas especializadas.' },
    { headline: 'Taller de matemáticas en {schoolName} mejora rendimiento escolar', content: 'Los estudiantes que participaron en el programa de reforzamiento mejoraron sus calificaciones en un 30% promedio.' },
    { headline: '{schoolName} implementa metodología de aprendizaje innovador', content: 'La nueva estrategia pedagógica basada en proyectos prácticos ha generado resultados positivos en la motivación estudiantil.' },
    { headline: 'Profesora de {schoolName} es nombrada Mejor Docente del Año', content: 'Su dedicación, creatividad y compromiso con la educación le valieron el reconocimiento más importante del sector.' },
    { headline: 'Biblioteca de {schoolName} digitaliza su catálogo completo', content: 'Los estudiantes ahora pueden acceder a más de 5,000 recursos educativos desde cualquier dispositivo con conexión a internet.' },
    { headline: 'Estudiantes de {schoolName} publican artículo en revista científica', content: 'Un grupo de investigadores jóvenes logró que su trabajo sobre ecosistemas acuáticos fuera aceptado en una publicación nacional.' },
    { headline: '{schoolName} lanza programa de tutorías entre pares', content: 'Los estudiantes con alto rendimiento académico ayudan a sus compañeros a superar dificultades en materias específicas.' },
  ],
};

// ─── Category emojis ─────────────────────────────────────────────

const CATEGORY_EMOJIS: Record<NewsArticle['category'], string> = {
  sports: '⚽',
  academic: '📚',
  social: '🤝',
  financial: '💰',
  infrastructure: '🏗️',
  crisis: '⚠️',
};

// ─── Helpers ─────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

// ─── Core generation ─────────────────────────────────────────────

export function generateLocalNews(state: {
  schoolName: string;
  currentWeek: number;
  reputation: number;
  studentSatisfaction: number;
  academicPerformance: number;
  activeStudents: number;
  money: number;
  weather: string;
  recentEvents: string[];
  achievements: string[];
}): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const vars = {
    schoolName: state.schoolName,
    studentCount: state.activeStudents,
    week: state.currentWeek,
    reputation: state.reputation,
    satisfaction: state.studentSatisfaction,
  };

  // Determine the mix based on school state
  const highReputation = state.reputation >= 70;
  const lowReputation = state.reputation <= 35;
  const highSatisfaction = state.studentSatisfaction >= 70;
  const lowSatisfaction = state.studentSatisfaction <= 35;
  const highAcademic = state.academicPerformance >= 75;
  const lowMoney = state.money < 5000;

  // Weather-based articles
  const severeWeather = ['stormy', 'hurricane', 'rainy'].includes(state.weather);

  // ── Article 1: Always one article based on reputation ──
  if (highReputation || highSatisfaction) {
    const template = pickRandom(NEWS_TEMPLATES.positive);
    articles.push({
      id: `news-1-${state.currentWeek}`,
      headline: fillTemplate(template.headline, vars),
      content: fillTemplate(template.content, vars),
      category: 'academic',
      emoji: '🏆',
      week: state.currentWeek,
      impact: 'positive',
      read: false,
    });
  } else if (lowReputation || lowSatisfaction) {
    const template = pickRandom(NEWS_TEMPLATES.negative);
    articles.push({
      id: `news-1-${state.currentWeek}`,
      headline: fillTemplate(template.headline, vars),
      content: fillTemplate(template.content, vars),
      category: 'crisis',
      emoji: '📉',
      week: state.currentWeek,
      impact: 'negative',
      read: false,
    });
  } else {
    const template = pickRandom(NEWS_TEMPLATES.neutral);
    articles.push({
      id: `news-1-${state.currentWeek}`,
      headline: fillTemplate(template.headline, vars),
      content: fillTemplate(template.content, vars),
      category: 'social',
      emoji: '📰',
      week: state.currentWeek,
      impact: 'neutral',
      read: false,
    });
  }

  // ── Article 2: Academic or Sports ──
  if (highAcademic) {
    const template = pickRandom(NEWS_TEMPLATES.academic);
    articles.push({
      id: `news-2-${state.currentWeek}`,
      headline: fillTemplate(template.headline, vars),
      content: fillTemplate(template.content, vars),
      category: 'academic',
      emoji: CATEGORY_EMOJIS.academic,
      week: state.currentWeek,
      impact: 'positive',
      read: false,
    });
  } else {
    const template = pickRandom(NEWS_TEMPLATES.sports);
    articles.push({
      id: `news-2-${state.currentWeek}`,
      headline: fillTemplate(template.headline, vars),
      content: fillTemplate(template.content, vars),
      category: 'sports',
      emoji: CATEGORY_EMOJIS.sports,
      week: state.currentWeek,
      impact: 'neutral',
      read: false,
    });
  }

  // ── Article 3: Financial or neutral ──
  if (lowMoney) {
    const template = pickRandom(NEWS_TEMPLATES.negative);
    const filtered = NEWS_TEMPLATES.negative.filter(t =>
      t.headline.includes('financiera') || t.headline.includes('presupuesto') || t.headline.includes('crisis')
    );
    const chosen = filtered.length > 0 ? pickRandom(filtered) : template;
    articles.push({
      id: `news-3-${state.currentWeek}`,
      headline: fillTemplate(chosen.headline, vars),
      content: fillTemplate(chosen.content, vars),
      category: 'financial',
      emoji: CATEGORY_EMOJIS.financial,
      week: state.currentWeek,
      impact: 'negative',
      read: false,
    });
  } else {
    const template = pickRandom(NEWS_TEMPLATES.positive);
    articles.push({
      id: `news-3-${state.currentWeek}`,
      headline: fillTemplate(template.headline, vars),
      content: fillTemplate(template.content, vars),
      category: 'financial',
      emoji: '✅',
      week: state.currentWeek,
      impact: 'positive',
      read: false,
    });
  }

  // ── Article 4: Weather-related (if applicable) ──
  if (severeWeather) {
    const weatherTemplates = NEWS_TEMPLATES.negative.filter(t =>
      t.headline.includes('energía') || t.headline.includes('Inundación') || t.headline.includes('tormenta')
    );
    if (weatherTemplates.length > 0) {
      const template = pickRandom(weatherTemplates);
      articles.push({
        id: `news-4-${state.currentWeek}`,
        headline: fillTemplate(template.headline, vars),
        content: fillTemplate(template.content, vars),
        category: 'infrastructure',
        emoji: CATEGORY_EMOJIS.infrastructure,
        week: state.currentWeek,
        impact: 'negative',
        read: false,
      });
    }
  }

  // ── Article 5: Random bonus article ──
  if (state.currentWeek % 2 === 0) {
    const allTemplates = [
      ...NEWS_TEMPLATES.positive,
      ...NEWS_TEMPLATES.neutral,
      ...NEWS_TEMPLATES.sports,
    ];
    const template = pickRandom(allTemplates);
    const category: NewsArticle['category'] = NEWS_TEMPLATES.sports.includes(template) ? 'sports' : 'social';
    articles.push({
      id: `news-5-${state.currentWeek}`,
      headline: fillTemplate(template.headline, vars),
      content: fillTemplate(template.content, vars),
      category,
      emoji: CATEGORY_EMOJIS[category],
      week: state.currentWeek,
      impact: Math.random() > 0.5 ? 'positive' : 'neutral',
      read: false,
    });
  }

  return articles;
}

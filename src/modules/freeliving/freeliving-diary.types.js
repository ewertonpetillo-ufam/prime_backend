"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIARY_SECTION_COUNT = exports.SYMPTOM_LABELS = exports.ACTIVITY_LABELS = exports.OPTIONAL_INTERVAL_ACTIVITIES = exports.OPTIONAL_TIMED_ACTIVITIES = exports.REQUIRED_TIMED_ACTIVITIES = exports.DIARY_SECTIONS = exports.DIARY_OVERVIEW_STATUSES = exports.PHONE_NEARBY_VALUES = exports.WATCH_USAGE_VALUES = exports.SYMPTOM_KEYS = exports.SYMPTOM_HOURS = void 0;
exports.SYMPTOM_HOURS = [
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
];
exports.SYMPTOM_KEYS = [
    'tremor',
    'slowness',
    'dyskinesia',
    'walking',
    'freezing',
];
exports.WATCH_USAGE_VALUES = [
    'all_day',
    'removed',
    'not_used',
];
exports.PHONE_NEARBY_VALUES = [
    'yes',
    'sometimes',
    'no',
    'unknown',
];
exports.DIARY_OVERVIEW_STATUSES = [
    'sem_registro',
    'em_preenchimento',
    'completo',
];
exports.DIARY_SECTIONS = [
    'medication',
    'activities',
    'symptoms',
    'devices',
];
exports.REQUIRED_TIMED_ACTIVITIES = [
    'morning_hygiene',
    'meal_1',
    'short_walk',
    'arms_extended_1',
    'arms_extended_2',
];
exports.OPTIONAL_TIMED_ACTIVITIES = [
    'meal_2',
    'meal_3',
    'spontaneous_walk',
    'other_activity',
];
exports.OPTIONAL_INTERVAL_ACTIVITIES = [
    'rest_1',
    'rest_2',
    'rest_3',
    'nap',
];
exports.ACTIVITY_LABELS = {
    morning_hygiene: 'Higiene da manhã / escovou os dentes',
    meal_1: 'Refeição 1',
    meal_2: 'Refeição 2',
    meal_3: 'Refeição 3',
    short_walk: 'Caminhada curta orientada',
    spontaneous_walk: 'Caminhada espontânea / saída de casa',
    arms_extended_1: 'Braços estendidos — 1ª vez',
    arms_extended_2: 'Braços estendidos — 2ª vez',
    other_activity: 'Outra atividade / evento importante',
    rest_1: 'Repouso sentado/deitado — 1º período',
    rest_2: 'Repouso sentado/deitado — 2º período',
    rest_3: 'Repouso sentado/deitado — 3º período',
    nap: 'Cochilou / dormiu durante o dia',
};
exports.SYMPTOM_LABELS = {
    tremor: 'Tremor',
    slowness: 'Lentidão/travamento',
    dyskinesia: 'Discinesia/balançando',
    walking: 'Dificuldade para caminhar',
    freezing: 'Travou para andar/congelamento',
};
exports.DIARY_SECTION_COUNT = 4;

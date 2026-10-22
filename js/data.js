const FINISHES = [{"name": "Голубой", "slug": "blue", "color": "#b3ceec", "gradient": ["#a1b9d3", "#a2b7d2", "#c5d7ed", "#c0d6ee", "#b2c9e8", "#b1cae9", "#aac1e0", "#a0b9d7"], "face": "#1d2a3f", "glint": "#fff", "accent": "#a9bdd6"}, {"name": "Шалфей", "slug": "sage", "color": "#c0d3bf", "gradient": ["#adbdab", "#aebbaa", "#d3dcc0", "#cedbc1", "#bfcebc", "#becfbd", "#b6c6b5", "#acbdae"], "face": "#1d2a3f", "glint": "#fff", "accent": "#adc0ad"}, {"name": "Песочный", "slug": "sand", "color": "#e3d4bd", "gradient": ["#ccbea9", "#cdbca8", "#faddbe", "#f3dcbf", "#e2cfba", "#e0d0bb", "#d8c7b3", "#cbbeac"], "face": "#1d2a3f", "glint": "#fff", "accent": "#c6b69d"}, {"name": "Графит", "slug": "graphite", "color": "#5e626b", "gradient": ["#5a5d66", "#5a5c65", "#62646b", "#62646c", "#5e616a", "#5e616a", "#5c5f68", "#595d66"], "face": "#1d2a3f", "glint": "#fff", "accent": "#727887"}];
const STATES=[
 {name:'Покой',color:'#b5c7da',icon:'<circle cx="133" cy="140" r="5" fill="#fff"/>'},
 {name:'Думает',color:'#9F86F0',icon:'<g fill="#c7baf6"><circle cx="117" cy="140" r="4"/><circle cx="133" cy="140" r="4"/><circle cx="149" cy="140" r="4"/></g>'},
 {name:'Работает',color:'#3BA9DC',icon:'<rect x="110" y="137" width="46" height="6" rx="3" fill="#67C2EC"/>'},
 {name:'Ждёт решения',color:'#E89A1E',icon:'<path d="M133 125v18" stroke="#F9B84B" stroke-width="6" stroke-linecap="round"/><circle cx="133" cy="154" r="3.5" fill="#F9B84B"/>'},
 {name:'Готово',color:'#34A853',icon:'<path d="M115 140l12 10 24-24" fill="none" stroke="#4BC771" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'},
 {name:'Задача в фоне',color:'#1FA595',icon:'<rect x="110" y="137" width="46" height="6" rx="3" fill="#3EC2B4"/>'},
 {name:'Не беспокоить',color:'#8E98C2',icon:'<path d="M140 124A17 17 0 1 0 147 155A14 14 0 0 1 140 124Z" fill="#A9B3D8"/>'},
 {name:'Сбой',color:'#7D838C',icon:'<path d="M133 126v12" stroke="#7d838c" stroke-width="6" stroke-linecap="round"/><circle cx="133" cy="150" r="3.5" fill="#7d838c"/>'}
];

/*
 * Translations of the strings BigBlueButton itself does not have.
 * Keys are client locale names (pt_BR) or bare languages (pt), which cover every
 * regional variant without an entry of its own. English is the reference: a
 * language may omit any key and falls back to it.
 *
 * Corrections from native speakers are welcome.
 */
const K = [
  'stack.label',
  'status.raisedHand',
  'preferences.hide',
  'preferences.show',
  'preferences.position',
  'position.navbarLeft',
  'position.navbarCenter',
  'position.actionsBarLeft',
  'position.mediaTopLeft',
  'position.mediaTopCenter',
  'position.mediaLeft',
  'position.floating',
];

const T = {
  en: ['Participant activity', 'Raised hand', 'Hide participant activity', 'Show participant activity', 'Position', 'Top bar', 'In place of the meeting title', 'Bottom bar', 'Top left of the content', 'Top of the content', 'Side of the content', 'Floating (drag to move)'],
  ar: ['نشاط المشاركين', 'يد مرفوعة', 'إخفاء نشاط المشاركين', 'إظهار نشاط المشاركين', 'الموضع', 'الشريط العلوي', 'مكان عنوان الاجتماع', 'الشريط السفلي', 'أعلى يسار المحتوى', 'أعلى المحتوى', 'جانب المحتوى', 'عائم (اسحب للتحريك)'],
  ca: ['Activitat dels participants', 'Mà alçada', "Amaga l'activitat dels participants", "Mostra l'activitat dels participants", 'Posició', 'Barra superior', 'En lloc del títol de la reunió', 'Barra inferior', 'A dalt a l\'esquerra del contingut', 'A dalt del contingut', 'Al costat del contingut', 'Flotant (arrossega per moure)'],
  cs: ['Aktivita účastníků', 'Zvednutá ruka', 'Skrýt aktivitu účastníků', 'Zobrazit aktivitu účastníků', 'Umístění', 'Horní lišta', 'Místo názvu schůzky', 'Dolní lišta', 'Vlevo nahoře nad obsahem', 'Nahoře nad obsahem', 'Na straně obsahu', 'Plovoucí (přesuňte tažením)'],
  da: ['Deltageraktivitet', 'Hånden oppe', 'Skjul deltageraktivitet', 'Vis deltageraktivitet', 'Placering', 'Øverste bjælke', 'I stedet for mødets titel', 'Nederste bjælke', 'Øverst til venstre i indholdet', 'Øverst i indholdet', 'I siden af indholdet', 'Flydende (træk for at flytte)'],
  de: ['Aktivität der Teilnehmenden', 'Hand gehoben', 'Aktivität der Teilnehmenden ausblenden', 'Aktivität der Teilnehmenden anzeigen', 'Position', 'Obere Leiste', 'Anstelle des Konferenztitels', 'Untere Leiste', 'Oben links im Inhalt', 'Oben im Inhalt', 'Seitlich im Inhalt', 'Schwebend (zum Verschieben ziehen)'],
  el: ['Δραστηριότητα συμμετεχόντων', 'Σηκωμένο χέρι', 'Απόκρυψη δραστηριότητας συμμετεχόντων', 'Εμφάνιση δραστηριότητας συμμετεχόντων', 'Θέση', 'Επάνω γραμμή', 'Στη θέση του τίτλου της σύσκεψης', 'Κάτω γραμμή', 'Επάνω αριστερά στο περιεχόμενο', 'Επάνω στο περιεχόμενο', 'Στο πλάι του περιεχομένου', 'Αιωρούμενο (σύρετε για μετακίνηση)'],
  es: ['Actividad de los participantes', 'Mano levantada', 'Ocultar la actividad de los participantes', 'Mostrar la actividad de los participantes', 'Posición', 'Barra superior', 'En lugar del título de la reunión', 'Barra inferior', 'Arriba a la izquierda del contenido', 'Arriba del contenido', 'Al lado del contenido', 'Flotante (arrastra para mover)'],
  fi: ['Osallistujien toiminta', 'Käsi ylhäällä', 'Piilota osallistujien toiminta', 'Näytä osallistujien toiminta', 'Sijainti', 'Yläpalkki', 'Kokouksen otsikon paikalla', 'Alapalkki', 'Sisällön vasen yläkulma', 'Sisällön yläreuna', 'Sisällön sivu', 'Kelluva (siirrä vetämällä)'],
  fr: ['Activité des participants', 'Main levée', "Masquer l'activité des participants", "Afficher l'activité des participants", 'Position', 'Barre supérieure', 'À la place du titre de la réunion', 'Barre inférieure', 'En haut à gauche du contenu', 'En haut du contenu', 'Sur le côté du contenu', 'Flottant (glisser pour déplacer)'],
  gl: ['Actividade dos participantes', 'Man erguida', 'Agochar a actividade dos participantes', 'Amosar a actividade dos participantes', 'Posición', 'Barra superior', 'No lugar do título da xuntanza', 'Barra inferior', 'Arriba á esquerda do contido', 'Arriba do contido', 'Ao lado do contido', 'Flotante (arrastre para mover)'],
  he: ['פעילות המשתתפים', 'יד מורמת', 'הסתרת פעילות המשתתפים', 'הצגת פעילות המשתתפים', 'מיקום', 'הסרגל העליון', 'במקום כותרת המפגש', 'הסרגל התחתון', 'בפינה העליונה של התוכן', 'בראש התוכן', 'בצד התוכן', 'צף (גרירה להזזה)'],
  hu: ['Résztvevők aktivitása', 'Felemelt kéz', 'Résztvevők aktivitásának elrejtése', 'Résztvevők aktivitásának megjelenítése', 'Elhelyezés', 'Felső sáv', 'A megbeszélés címe helyén', 'Alsó sáv', 'A tartalom bal felső sarkában', 'A tartalom tetején', 'A tartalom szélén', 'Lebegő (húzással mozgatható)'],
  id: ['Aktivitas peserta', 'Tangan terangkat', 'Sembunyikan aktivitas peserta', 'Tampilkan aktivitas peserta', 'Posisi', 'Bilah atas', 'Menggantikan judul rapat', 'Bilah bawah', 'Kiri atas konten', 'Bagian atas konten', 'Sisi konten', 'Mengambang (seret untuk memindahkan)'],
  it: ['Attività dei partecipanti', 'Mano alzata', "Nascondi l'attività dei partecipanti", "Mostra l'attività dei partecipanti", 'Posizione', 'Barra superiore', 'Al posto del titolo della riunione', 'Barra inferiore', 'In alto a sinistra del contenuto', 'In alto nel contenuto', 'A lato del contenuto', 'Mobile (trascina per spostare)'],
  ja: ['参加者のアクティビティ', '挙手中', '参加者のアクティビティを隠す', '参加者のアクティビティを表示', '位置', '上部バー', '会議タイトルの位置', '下部バー', 'コンテンツの左上', 'コンテンツの上部', 'コンテンツの横', 'フローティング（ドラッグで移動）'],
  ko: ['참가자 활동', '손 들기', '참가자 활동 숨기기', '참가자 활동 표시', '위치', '상단 바', '회의 제목 자리', '하단 바', '콘텐츠 왼쪽 위', '콘텐츠 위쪽', '콘텐츠 옆', '플로팅(드래그하여 이동)'],
  nb: ['Deltakeraktivitet', 'Hånden oppe', 'Skjul deltakeraktivitet', 'Vis deltakeraktivitet', 'Plassering', 'Øvre linje', 'I stedet for møtetittelen', 'Nedre linje', 'Øverst til venstre i innholdet', 'Øverst i innholdet', 'På siden av innholdet', 'Flytende (dra for å flytte)'],
  nl: ['Activiteit van deelnemers', 'Hand opgestoken', 'Activiteit van deelnemers verbergen', 'Activiteit van deelnemers tonen', 'Positie', 'Bovenste balk', 'Op de plaats van de vergadertitel', 'Onderste balk', 'Linksboven in de inhoud', 'Boven in de inhoud', 'Aan de zijkant van de inhoud', 'Zwevend (sleep om te verplaatsen)'],
  pl: ['Aktywność uczestników', 'Podniesiona ręka', 'Ukryj aktywność uczestników', 'Pokaż aktywność uczestników', 'Położenie', 'Górny pasek', 'W miejscu tytułu spotkania', 'Dolny pasek', 'Lewy górny róg treści', 'Góra treści', 'Bok treści', 'Pływające (przeciągnij, aby przesunąć)'],
  pt: ['Atividade dos participantes', 'Mão levantada', 'Ocultar a atividade dos participantes', 'Mostrar a atividade dos participantes', 'Posição', 'Barra superior', 'No lugar do título da reunião', 'Barra inferior', 'Canto superior esquerdo do conteúdo', 'Topo do conteúdo', 'Lateral do conteúdo', 'Flutuante (arraste para mover)'],
  ro: ['Activitatea participanților', 'Mână ridicată', 'Ascunde activitatea participanților', 'Arată activitatea participanților', 'Poziție', 'Bara de sus', 'În locul titlului ședinței', 'Bara de jos', 'Stânga sus peste conținut', 'Sus peste conținut', 'Lateral față de conținut', 'Flotant (trageți pentru a muta)'],
  ru: ['Активность участников', 'Поднятая рука', 'Скрыть активность участников', 'Показать активность участников', 'Расположение', 'Верхняя панель', 'На месте названия встречи', 'Нижняя панель', 'Слева вверху над содержимым', 'Вверху над содержимым', 'Сбоку от содержимого', 'Плавающее (перетащите, чтобы переместить)'],
  sv: ['Deltagaraktivitet', 'Uppräckt hand', 'Dölj deltagaraktivitet', 'Visa deltagaraktivitet', 'Placering', 'Övre fältet', 'I stället för mötets titel', 'Nedre fältet', 'Uppe till vänster i innehållet', 'Överst i innehållet', 'Vid sidan av innehållet', 'Flytande (dra för att flytta)'],
  tr: ['Katılımcı etkinliği', 'El kaldırıldı', 'Katılımcı etkinliğini gizle', 'Katılımcı etkinliğini göster', 'Konum', 'Üst çubuk', 'Toplantı başlığının yerinde', 'Alt çubuk', 'İçeriğin sol üstü', 'İçeriğin üstü', 'İçeriğin yanı', 'Yüzen (taşımak için sürükleyin)'],
  uk: ['Активність учасників', 'Піднята рука', 'Приховати активність учасників', 'Показати активність учасників', 'Розташування', 'Верхня панель', 'На місці назви зустрічі', 'Нижня панель', 'Ліворуч угорі над вмістом', 'Угорі над вмістом', 'Збоку від вмісту', 'Плаваюче (перетягніть, щоб перемістити)'],
  vi: ['Hoạt động của người tham gia', 'Giơ tay', 'Ẩn hoạt động của người tham gia', 'Hiện hoạt động của người tham gia', 'Vị trí', 'Thanh trên cùng', 'Thay cho tiêu đề cuộc họp', 'Thanh dưới cùng', 'Góc trên bên trái nội dung', 'Phía trên nội dung', 'Bên cạnh nội dung', 'Nổi (kéo để di chuyển)'],
  zh_CN: ['参与者动态', '已举手', '隐藏参与者动态', '显示参与者动态', '位置', '顶部栏', '替代会议标题', '底部栏', '内容左上角', '内容顶部', '内容侧边', '浮动（拖动以移动）'],
  zh_TW: ['參與者動態', '已舉手', '隱藏參與者動態', '顯示參與者動態', '位置', '頂端列', '取代會議標題', '底部列', '內容左上角', '內容頂端', '內容側邊', '浮動（拖曳以移動）'],
};

module.exports = Object.fromEntries(Object.entries(T).map(([locale, values]) => {
  if (values.length !== K.length) throw new Error(`${locale}: ${values.length} strings, expected ${K.length}`);
  return [locale, Object.fromEntries(K.map((key, index) => [key, values[index]]))];
}));

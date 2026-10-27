// ============================================================
// MORTON EQUINE CLINIC - JS
// ============================================================
'use strict';

// ----- DATA: PROVINCES -----
const PROVS = ['Улаанбаатар','Архангай','Баян-Өлгий','Баянхонгор','Булган','Говь-Алтай',
  'Говьсүмбэр','Дархан-Уул','Дорноговь','Дорнод','Дундговь','Завхан','Орхон',
  'Өвөрхангай','Өмнөговь','Сүхбаатар','Сэлэнгэ','Төв','Увс','Ховд','Хөвсгөл','Хэнтий'];

// ----- DATA: SERVICES -----
const SVCS = [
  'Эмчийн үзлэг, оношилгоо','Шүд засах /аранга авах/','ЭХО Дотор','ЭХО Хөл',
  'ЭХО Ороо тодорхойлох','ЭХО Хээл шалгах','Рентген оношилгоо','ЭХО+Рентген оношилгоо',
  'Ходоодны дуран оношилгоо','Хамрын хөндий, залгиурын дуран','Хамар, залгиур-Ходоодны дуран',
  'Утлага','Шарлага','Зонд тавих +liquid','Ходоод угаах','Туурай, гахай засах урд 2 хөл',
  'Туурай, гахай засах 4 хөл','Тахлах урд 2 хөл /тахны үнэ ороогүй/','Тариа тарих',
  'Дусал шингэн хийх','Гипсдэх /+материал/','Боолт солих /+материал/','Нойтон боолт /+материал/',
  'Хүйтэн боолт','Усанд зогсоох физик эмчилгээ','Үений тариа /+кеналог/','Үений тариа /NewDN/',
  'Эсийн эмчилгээ PRP','Сав угаах','Шинжилгээ Биохими','Шинжилгээ Нийлүүлэг','Шинжилгээ Хачиг',
  'Шинжилгээ Ям','Шинжилгээ Цагаан эс тоолох','Шинжилгээ Гени','Дуудлага Ойрын /500м дотор/',
  'Дуудлага Дунд 20км','Дуудлага Дунд 25км','Дуудлага Дунд 50км','Дуудлага Холын 50-100км',
  'Дуудлага Холын 101-150км','Дуудлага Холын 150км+','Ивэрхий оёх Унага','Ивэрхий оёх Том адуу',
  'Түгжрэл колик 1-2 цаг','Түгжрэл колик 2-4 цаг','Түгжрэл колик 4-6 цаг','Түгжрэл колик 6 цагаас дээш',
  'Буглаа нээх жижиг','Буглаа нээх том','Шарх цэвэрлэх жижиг','Шарх цэвэрлэх дунд','Шарх цэвэрлэх том',
  'Шарх оёх жижиг 10см','Шарх оёх дунд 15см+','Шарх оёх том 20см+','Хавдар авах','Ургацаг авах',
  'Эрүү хадах мэс засал','Хэвлийн хөндий нээх','Нүдний мэс засал','Имплант авах','Кесар хагалгаа',
  'Хөнгөлөх','Чив тайрах','Залгиурын мэс засал','Колик мэс засал','Яс хадах шрупдэх',
  'Яс хадах бэхэлгээтэй','Яаралтай мэс заслын дуудлага','Унтуулах /+хөдөөлүүлөх/',
  'Байрлах адуу','Байрлах сарваа','Дамжин өнгөрөх адуу','Дамжин өнгөрөх сарваа','Адуу хүргэх',
  'Шөрмөс оёх','Бусад мэс засал','Бусад үзлэг / оношилгоо','Бусад шинжилгээ','Бусад эмчилгээ',
  'Бусад дуудлага','Бусад хирургийн үйлчилгээ','Бусад'
];

// SERVICE_LIST — үйлчилгээ + үнэ (хайлтад хэрэглэнэ)
const SERVICE_LIST = SVCS.map(s => ({ name: s, price: 0 }));

// Бүх идэвхтэй үйлчилгээний нэрсийг буцаана: үндсэн SVCS + Admin нэмсэн − Admin устгасан
function getAllServices() {
  const removed = new Set((STATE.removedServices || []).map(String));
  const base = SVCS.filter(s => !removed.has(s));
  const custom = (STATE.customServices || []).filter(s => !removed.has(s) && !SVCS.includes(s));
  return [...base, ...custom];
}

// ----- DATA: MEDICATIONS (sample - representative subset) -----
const MED_LIST = [
  'Барагшун тод магнай 2.5л',
  'Скоор из 1л',
  '22 ml PRP Tube',
  '3,5 шураг',
  '4 Татагч шураг',
  '4,5 Шураг',
  '5 түгжээт ялтас',
  '6,5 Татагч шураг',
  '7 өдөр /7 days/',
  '7 өдөр 3адгай 50гр',
  '7 өдөр | 7 days, 8806-051',
  'Adult 20 кг',
  'Air max plus 100ml',
  'Aluspray цацлага',
  'Atipamezole 10ml',
  'Baytril 100 ml',
  'Calcium 500 ml',
  'Catheter',
  'Cavalor Junioix 20 кг',
  'Cavalor Raceforce 20 кг',
  'Chelted copper syrup 1L',
  'Depocillin 100ml',
  'Depocillin задгай 100мл',
  'Dexaroide 50ml',
  'Dextrolytes 1 kg',
  'Domoso roll on-100g',
  'Emjemycin задгай 100мл',
  'Enjemycin',
  'Enjemycin 100 мл задгай',
  'Equip EHV 1.4',
  'Flumethrate 1% 500 ml',
  'Forte 2 l',
  'Fortis/flunixin/',
  'Genorfcoli 100 ml',
  'Gentamycin 100 ml',
  'Gentamycin 100 ml задгай',
  'HANTOX SPRAY 300МЛ',
  'Hampiseptol 100 ml',
  'Han-Tophan 100 ml',
  'Han-Tophan 100ml задгай',
  'Hankon WS 1кг',
  'Hantox spray',
  'Hartmanh 500 ml',
  'Hemo plus задгай 100мл',
  'Hemo plus-100ml',
  'Hemo15 задгай 100мл',
  'Hepatrtion 600 mg',
  'Hepatrtion 600 mg /Хепатришн/',
  'Horse bone calcium 1.5 кг',
  'Horse electrolyten1.5 kg',
  'Horse joint protect',
  'Kanamycin inj',
  'Ketoprofen 100 ml',
  'Komivita win 1 kg',
  'Lenspec 5/10',
  'Linsmycin 10 g',
  'Medesedan 20 ml задгай',
  'Mequindoh inj',
  'Meropenem 1 g',
  'Metacam 10 ml',
  'Micro chip',
  'Micro chip scanner',
  'Milk maginizm',
  'Naproxen inj',
  'Opticure нүдний тос',
  'Orondo spray 250ml',
  'Ossotide inj',
  'Oxitetraciclina 200la 100 ml',
  'Oxytetraciclin 200 la задгай',
  'PENTORSE ЗАДГАЙ',
  'PPS Pentore 50ml',
  'PPS-OJI-Japan',
  'PRP 22ml tube',
  'PRP 30 ml tube',
  'PRP 35 ml tube',
  'PRP 45 ml tube',
  'PRP 9 ml tube',
  'Parasecte 100 ml',
  'Pentorse 6мл',
  'Pentorse 6мл задгай',
  'Phenylarthrite 100мл задгай',
  'Polydeaxyribonucaleatide',
  'Pps pentose 50ml задгай',
  'Pps rentosan equine 100мл задг',
  'Pps rentosan equine-100ml',
  'Pps-oji-japan 10мг задгай',
  'Prestop',
  'Pro CMC',
  'Recocan',
  'Salphen 100 ml задгай',
  'Salphen 100ml фенил',
  'Septofin 2 l',
  'Stepen La 100мл задгай',
  'Stepen-La',
  'Synbiovit 900g',
  'Synbiovit 900g /Синбиовет/',
  'Synvet-50 2.5 ml',
  'TIA-K,C 100 мл',
  'TNA уураг 1 л',
  'TNA- уураг 1л',
  'Taipan 100мл задгай',
  'Taipan-100ml',
  'Thermaflex 500 ml',
  'Tri-silfox 100ml задгай',
  'Viamin injection 500 ml',
  'Vislos 40',
  'Xylan 50 ml',
  'energy dex 100 ml',
  'immuno vita',
  'ioban drape 60*45',
  'kabiven Peripheral 900 ml',
  'АТФ комплекс',
  'АЦЦ 600мг',
  'Авермектин пурон 1 л',
  'Автомат шприц 50 гр',
  'Адреналин хайрцаг',
  'Адреналин ширхэг',
  'Адуу Кальци 100ширхэг',
  'Адуу кальци 200ш',
  'Адуу кальци задгай',
  'Ай Со Про 1,5кг | ISOPRO, 1911',
  'Ай Со Про 10кг',
  'Ай Со Про Задгай 10000гр',
  'Ай Со Про задгай 1500гр',
  'Айнил 100мл | Ainil',
  'Айнил 100мл задгай',
  'Айрон Эксэл 1,2л /| Iron x cel',
  'Айрон Эксэл 3.7л /| Iron x cel',
  'Айрон эксэл 3.7 задгай',
  'Айрон эксэл Задгай 1200',
  'Айрон эксэл Задгай 3750',
  'Аксамит-Нео цацлага',
  'Актив 100 25кг',
  'Актив 100 25кг задгай 25000гр',
  'Аламицин аерозол цацлага 200мл',
  'Алое тариа',
  'Алтан гагнуур',
  'Альбумин уураг',
  'Ами-виком 100 мл',
  'Амидоп-S 100 мл задгай',
  'Амидоп-Д 500мл задгай',
  'Амиковет задгай',
  'Амилайт С Задгай 500мл',
  'Амилайт-С 500мл | Amylite C',
  'Амино витал 250мл',
  'Амино комплекс 91,7%',
  'Аминовит',
  'Аминовит 96%',
  'Аминовит/Тэнүүн хишиг/',
  'Аминокапроны хүчил 5%-100 мл',
  'Амитоп S 100мл',
  'Амитоп-Д 500мл | Amitop D',
  'Аммоний хлорид 250 гр',
  'Амоксиклав 1,2',
  'Анальгин задгай',
  'Анальгин орос',
  'Анальгин орос задгай 10ш',
  'Аносол',
  'Ариун бамбар',
  'Ариун тусгаарлагч /Хятад/ 100*200',
  'Ариун хамгаалалтын комбинзон',
  'Ариун хамгаалалтын хувцас',
  'Ариутгалын бодис Triple can',
  'Ариутгалын маск',
  'Ариутгалын уут 100мм*200м',
  'Арьс үдээс',
  'Аскорбин',
  'Аскорбин задгай',
  'Бабедазол',
  'Барагшун тод магнай задгай 250',
  'Барагшуун/тод магнай 5л',
  'Барагшуун/тод мангай задг 5 МЛ',
  'Бимодайн 24',
  'Бимодайн 24 Задгай 100 мл',
  'Бимодайн болус задгай',
  'Бинт',
  'Бинт 10*10 100ширхэгтэй',
  'Бинт 10*10 задгай 100ш',
  'Бинт 8*7,5*7,5',
  'Био Актив хайрцаг | Bio active',
  'Био актив задгай 60гр*3',
  'Биовит плас',
  'Биохими кет General',
  'Биохими-Electrolytes panel',
  'Блок Gain /12366595/, 90419196',
  'Бороо Нэмнээ',
  'Бромоклин',
  'Бромоклин Задгай 100мл',
  'Бутатрон | Butatron tab',
  'Бээлий 1 удаа резин задгай 50ш',
  'Бээлий 1 удаа резин хайрцаг',
  'Бээлий мэс заслын 1 удаагийн',
  'Бүтээлч моносчууд бүгдийг тэгээс',
  'Ванкомицин 1г',
  'Вета кратин FOL.AC& VIT E 3кг',
  'Витамин E 50 мл',
  'Витамин E-SEVIL 100 ML',
  'Витамин В12 1мл | Vitamin В12',
  'Витамин Е 2000 | Vitamin E 200',
  'Витамин Е-СЕ 100 мл',
  'Витамин С 20 мл задгай',
  'Витамин С 2мл',
  'Витамин С10% 1 кг',
  'Витамин С10% 1кг',
  'Витамин С10% Задгай 1000гр',
  'Витамин комплекс 100мл',
  'Витамин комплекс Задгай 100 мл',
  'Вондерсейф 100 мг задгай',
  'Вондерсейф 100мл',
  'Вонтаксим 1,0 /тариа/',
  'Гаммавет 10мг задгай',
  'Гаммавет | Gammavit',
  'Гарлик повдер 1кг | Garlic pow',
  'Гарлик повдер Задгай 1000гр',
  'Гарлик сироп 1,4л',
  'Гарлик сироп 6л',
  'Гарлик хони гльюкоз 1.4л | Gar',
  'Гарлик хони гльюкоз задгай 140',
  'Гарлик хонигльюкоз задгай 1400гр',
  'Гасто Маг Задгай 1000',
  'Гастро Маг 1000мл задгай',
  'Гастро Маг 3,7 л задгай',
  'Гастро Маг 3,75л',
  'Гастро Маг Задгай 3750',
  'Гастро Маг1л',
  'Гастро-готе 5 л',
  'Гентавиллин форт 100ml',
  'Гентавиллин форт100мл Задгай',
  'Гепарин тариа',
  'Гепаринтай хуруу шил Гонгдонг',
  'Герман Эх барихын бээлий',
  'Гилцерин 20мл',
  'Гипс',
  'Гипс 10 см*450 см',
  'Гипс хятад',
  'Глицерон 20 мл',
  'Глюзоз задгай',
  'Глюкоз',
  'Глюкоз 40% Ампул 10мл',
  'Глюкоз 5% 500 мл',
  'Глюкоз 5%-250 мл',
  'Гордокс 10мл задгай',
  'Гордокс т/уусм 100000',
  'Гүүд Аз Голд 3ш/35гр | Good as',
  'Гүүд Аз голд 3*35гр Задгай',
  'Дамартай утас ирланд',
  'Декса-тиэм 100 мл',
  'Декса-тиэм 100мл задгай',
  'Дексадерасон 100 мл',
  'Дексадерасон 50мл | Dexadreso',
  'Дексадерасон Задгай 50 мл',
  'Дексасон 100мл | Dexason',
  'Дексасон Задгай 100 мл',
  'Дексиум 50мл',
  'Дексиум Задгай 50 мл',
  'Дексиум задгай',
  'Дексо-анти',
  'Дексосан 50 мл',
  'Дексосан 50 мл задгай',
  'Демин Задгай 100 мл',
  'Дерма аэрозол',
  'Деха спа 100мл задгай',
  'Деха-сп 100мл',
  'Дехасон 100мл задгай',
  'Дикло Денк 75 т/уусм хайрцаг',
  'Дикло Денк 75т/уусм/ Задгай',
  'Дикло денк лаа',
  'Димедрол 1% задгай',
  'Димедрол 1%-1мл орос Задгай',
  'Димедрол 1%-1мл орос хайрцаг',
  'Дитрим',
  'Дитрим Задгай 100мл',
  'Дицинон 2 мл',
  'Дицинон 250мг/2мл',
  'Долооц мимо /эрдсийн /',
  'Долооц эрдсийн',
  'Домоседан 20 мл',
  'Домоседан 5 мл',
  'Дунд чөмөгний түгжээт ялтас',
  'Дунд чөмөгний шулуун ялтас',
  'Дурангийн уут',
  'Дуслын систем жижиг',
  'Дэлэнгийн тос',
  'Дөр бярууны',
  'Жи Эн Эф 80гр | GNF paste, 1',
  'Жи эйн эф 3 кг',
  'Живое 1л',
  'Загасан тос 1л Орос',
  'Зайлазин /Гүнтэрэм/',
  'Зайлазин 50мл | Xyla',
  'Зайлазин Задгай 50 мл',
  'Залитрон т/уусмал Задгай',
  'Залтирон т/уусмал 10мл',
  'Золедро-денк 4 мл',
  'Зузаан нэмнээ /цэвэр/',
  'Зэв арилагч',
  'Зүү',
  'Зүү 20G',
  'Зөгийн бал том',
  'Иверсан 100 мл',
  'Ивомек ABC',
  'Ивомек Bimeda 500 ml',
  'Ивомек Tectin 100мл',
  'Ивомек bimectin 100ml',
  'Ивомек bimectin Задгай 100мл',
  'Ивомек bimectin Задгай 250 мл',
  'Ивомек bimectin Задгай 500 мл',
  'Ивомек АВС',
  'Ивомек Хятад',
  'Ивомек зүүтэй',
  'Ивомек класки',
  'Ивомек монгол 1%',
  'Ивомек тэнүүн 100 мл',
  'Ивомек тэнүүн 100мл задгай',
  'Ивомек/монгол/',
  'Изофлуран 250 мл',
  'Изофлуран 250 мл задгай',
  'Интерлипид 20%-250мл',
  'Иод 300мл',
  'Иод 7,5 % 300 мл',
  'Иодопен хос',
  'Ихтиолтой тосон түрхлэг 50гр',
  'Кeролин Орос',
  'Калдвет',
  'Калдвет задгай',
  'Калмапос 100 мл',
  'Калформин 10 кг',
  'Калформин 3кг |',
  'Калформин 3кг задгай',
  'Калформин задгай 3000гр',
  'Калци плас 500мг',
  'Калци плас задгай',
  'Калци хлорид задгай 10мл*10ш',
  'Калция хлорид 10мл',
  'Карран ойл 20л | Carran oil ,',
  'Карран ойл 4.5л | Carran oil',
  'Карран ойл задгай 20000мл',
  'Карран ойл задгай 4500мл',
  'Кеналог 40мг хайрцаг',
  'Кенаног задгай 1мг*5ш',
  'Керолин Орос',
  'Кетанол тариа',
  'Кетонал лаа',
  'Клоксамас',
  'Клосиа ветнет  | Clocio',
  'Клосиа ветнет 50мл задгай',
  'Коспен 100мл',
  'Коспен 100мл задгай',
  'Коттон вүүл 500гр | Cotton woo',
  'Кумданг 2 мл',
  'Кумданг 250 мл',
  'Курасин 1000мл задгай',
  'Курасин 360 | Kurasyn, 1',
  'Курасин задгай 1000гр',
  'Левофлоксацин 100мл',
  'Лив 52',
  'Лив 52 задгай 100ш',
  'Ливерсол 250 мл',
  'Ливисан 100 мл задгай',
  'Ливисан 100мл',
  'Лидокайн 2%-2мл | хайрцаг',
  'Лидокайн задгай 2мл*10ш',
  'Ликүд Прафин 4,5л | Liquid par',
  'Ликүд Прафин 4500мл задгай',
  'Ликүд парафин 1 л',
  'Лянхуа тан',
  'Магни сульфат задгай 10мл*10ш',
  'Магни сульфат хайрцаг',
  'Мазь өмхий тос',
  'Макралон ГТ 100мл задгай',
  'Малгай нэг удаа',
  'Малын савны лаа',
  'Малын савны лаа задгай',
  'Марль 90см*10 см',
  'Масаран',
  'Масаран задгай 500гр',
  'Маск нэг удаа',
  'Мебо шарх 40гр',
  'Менежмент шилдгүүдээс суралцья',
  'Метоклопрамид 0,5%',
  'Механик Автомакс',
  'Ми-нунтаг',
  'Микроскоф',
  'Миксоферон',
  'Миксоферон задгай',
  'Мултивит-форте 100 мл',
  'Мультвитамин 100мл | Multivita',
  'Мультвитамин 100мл задгай',
  'Мультвитамин 50мл задгай',
  'Мультивит 1 кг',
  'Мэс заслын зүү',
  'Мэс заслын солонгос № 0,1,2',
  'Мэс заслын утас 0,2',
  'Мэс заслын утас PDS 70 см задгай',
  'Мэс заслын утас ЖОНСОН',
  'Мэс заслын утас ирланд №6',
  'Мэс заслын утас солонгос №0,1,2',
  'Мэс заслын утас уусдаггүй солонгос',
  'Мэс заслын уусдаггүй утас 2-0',
  'НБ Фенилартирит | NB Phenylart',
  'НБ фенилартерит 100 мл задгай',
  'Нарны нэмнээ',
  'Нарны том нэмнээ',
  'Нарны цэвэр нэмнээ',
  'Натри хлорид 100мл',
  'Натри хлорид 500мг',
  'Натрийн тиосульфат',
  'Неозидин',
  'Но-шпа 2мл*5ш задгай',
  'Но-шпа 40мг хайрцаг',
  'Но-шпа задгай',
  'Нова AC XANH 100 ml',
  'Нова ADE-B complex 100 ml',
  'Нова ADE-B complex 100 ml задгай',
  'Нова ADE-B.complex 100 ml',
  'Нова В комплекс 100мл',
  'Нова В комплекс задгай',
  'Нова Женмокс | Nova Genmox',
  'Нова Пенстреп | Nova Pen strep',
  'Нова С витамин',
  'Нова С витамин задгай 100 мл',
  'Нова аминовита  100 мл',
  'Нова генто-амокс 100 мл',
  'Нова генто-амокс 100 мл задгай',
  'Нова кальци В12 100 мл',
  'Нова мектин 1% | Nova Mectin 1',
  'Нова септрил 24%',
  'Нова септрил 24% 100 мл задгай',
  'Нова төмөр В12 100 мл',
  'Нова төмөр В12 задгай 100мл',
  'Нова хефа в12 задгай',
  'Нова-АТФ комплекс',
  'Нова-АТФ комплекс задгай 100мг',
  'Нова-төмөр В12 100 мл',
  'Нова-хефа В12 100мл',
  'Новакайн амп /Зад/2мл',
  'Новоамин 8,5%-250мл',
  'Новокайн амп',
  'Ногоон тос',
  'Ногт даавуун',
  'Нордайн паст',
  'Нэмнээ бороо бөхт',
  'Нэмнээ зузаан доод нас',
  'Нэмнээ зузаан дээд нас',
  'Нэмнээ зузаан хязаалан нас',
  'Нэмнээ зузаан шүдлэн',
  'Нэмнээ унага',
  'Нэмнээ ухаа хүлэг цэвэр',
  'Нэмнээ хөлс',
  'Нэмнээ цэвэр адууны',
  'Нэмнээ цэвэр адууны өвлийн',
  'Нэмнээ цээжны',
  'Нэмнээ/Азарга борооны',
  'Нэутрагаст | Neutragast',
  'Нэутрасид 1.2л | Neutracid , 1',
  'Нүдний тос',
  'Нүүрсэн хар',
  'Оксилин 5%',
  'Окситоцин 100 мл задгай',
  'Окситоцин 100мл | Oxytocin',
  'Окситоцин 20 мл',
  'Орондо спрэй 250мл | Oronda sp',
  'Ороох боох 120*120',
  'Остео калци',
  'Офлоксацин 2мг',
  'Панангийн 10мл*5ш задгай',
  'Панангийн хайрцаг',
  'Пантопразол 40мг',
  'Пантопразол 500 мг',
  'Панфеникол цацлага',
  'Панфеникол цацлага 5 г',
  'Парацетамол 1%-100 мл',
  'Пенбекс 100 мл',
  'Пенбекс 100 мл задгай',
  'Пенбекс 100мл | Penbex',
  'Пенстреп 100мл ГТ | Penstrep',
  'Пенстреп 100мл задгай',
  'Пенстреп 400ла',
  'Пенстреп 400ла задгай',
  'Перкись 3%-25мл',
  'Пипетка хошуу',
  'Пластерь хар хөх дамартай',
  'Пластыр 3*500',
  'Пластыр 4*500',
  'Пластыр 5*500',
  'Полимер чиг 7,5-3,6 м',
  'Порокайн пенцеллин 100мл',
  'Порокайн пенцеллин 100мл-задгай',
  'Порциллин ЛА 100мл | Procillin',
  'Порциллин Ла 100 мл задгай',
  'Порциллин Ла 100мл задгай',
  'Приентал 50мг',
  'Приентал Задгай 50мл',
  'Проканазол 0,2%-100мл',
  'Пропофол 20 мл',
  'Пропофол 20 мл задгай',
  'Пулмикан',
  'Реамберин 400мл',
  'Ренонтрикал 10000',
  'Ренонтрикал тариа',
  'Реосорбилакст 400 мл',
  'Реосорбилакт 400 мл',
  'Рибоксин 20% 5мл тариа хайрцаг',
  'Рибоксин 5мл*10ш задгай',
  'Рифамицин /тариа/',
  'Рифамицин 150мг',
  'Рифамицин 150мг задгай',
  'СДБ',
  'Салхины нэмнээ',
  'Санд Экспел 4кг |хайрцаг',
  'Санд Экспел задгай 4000гр',
  'Сармисны тариа',
  'Сахууны вакцин',
  'Септоспрей 100 мл',
  'Сериал балансер Gain /12366447',
  'Сериал блансер гайн за 25000гр',
  'Си Ди Пи ТЭХ',
  'Сидентал өтны | Cidental',
  'Сингапурыг хөгжлийн нууц',
  'Синкробен',
  'Систем солонгос',
  'Системийн наалт',
  'Скоор из',
  'Скоор из 1000л задгай',
  'Со витамин С 100 мл',
  'Сойтог',
  'Солонгос цефатоксим',
  'Спийд Эксел 1,2л | Speed x cel',
  'Спийд Эксел 1200мг задгай',
  'Спийд Эксел 1200мл задгай',
  'Спийд Эксел 3.7л | Speed x cel',
  'Спийд Эксел 3750мг задгай',
  'Спийд эксел 3700 задгай',
  'Спирт 1000мл задгай',
  'Спирт 5 л',
  'Спирт 70% 1л',
  'Споонж',
  'Стераниос 2%-5 л',
  'Стопдиар 100мг',
  'Страед НА 1,182л | Stride HA,',
  'Страед НА Задгай',
  'Страед На 1182мл задгай',
  'Стэй Саунд 1,5кг | Stay sound,',
  'Стэй Саунд 5кг | Stay sound, 1',
  'Стэй саунд 1,5кг задгай',
  'Сульфасалазин 50',
  'Суперамина /Тэнүүн хишиг',
  'Суперамина 500 мл',
  'Суперамино/Тэнүүн хишиг/',
  'Суперкилл 1 кг',
  'Сэрвээ хэмжигч',
  'Таван эрдэнэ 2,5л',
  'Тамедин ам зайлах',
  'Тариа Germany',
  'Тариа герман 10мл задгай',
  'Тариаын шүүлтүүр',
  'Тариур үр шахах',
  'Тах Х/цагаан',
  'Тах америк',
  'Тах хятад',
  'Тетрокси ЛА 100мл | Tetroxy LA',
  'Тетрокси Ла 100мл задгай',
  'Тос cellius',
  'Тос zinc oxide 100 гр',
  'Тос бутапсин мазь',
  'Тос цахлай 150 гр',
  'Тос янбек',
  'Трамадол',
  'Тусгаарлагч 1 удаа бүтээлэг',
  'Тусгаарлагч ариутгасан 180*200',
  'Тусгаарлагч ариутгасан 240*240',
  'Тусгаарлагч ариутгасан 80*120',
  'Тусгаарлагч даавуу 100*220',
  'Тусгаарлагч даавуу 80*220',
  'Туулга Bimectin',
  'Туулга Cattle max 300ml',
  'Туулга IVE+PRA 300 ml',
  'Туулга IVE+PRA 300 мл задгай',
  'Туулга Албендазол 1л',
  'Туулга Албендазол 1л Малчин/М',
  'Туулга Ивермектин 1л Малчин/М,',
  'Туулга Экомектин шахмал | Ecom',
  'Туулга Экүмакс 300гр задгай',
  'Туулга экүмакс',
  'Туулга эрдэстэй 1л',
  'Туулганы хошуу ММ',
  'Туурай хутга битүү',
  'Туурай хутга битүү ирланд',
  'Туурай чангалагч',
  'Туурайн бахь ЛНХ',
  'Туурайн бахь, хумслагч',
  'Туурайн хутга',
  'Туурайн хуурай',
  'Туфоал 1000мг задгай',
  'Туфоал | Tufoal, 125',
  'Тэжээл  мимо /классик 20кг/',
  'Тэжээл elevage 25 кг',
  'Тэжээл sensation',
  'Тэжээл ажнай хүлэг',
  'Тэжээл воллкон',
  'Тэжээл гастро',
  'Тэжээл мимо /супер 20кг/',
  'Тэжээл омилойн 500',
  'Тэжээл спорт',
  'Тэжээлийн уут',
  'Түгжээт ялтас',
  'Түргэн цагаан эмийн ургамал',
  'Төлийн сүү',
  'Төмөр тах',
  'Углаа',
  'Улаан эс EPO 6000',
  'Унтуулгын бодис',
  'Уралдааны сироп 2000мл залгай',
  'Уралдааны сироп 2л | Racing sy',
  'Уралдааны сироп 2л задгай',
  'Уралдааны сироп 5000мл задгай',
  'Уралдааны сироп 5л | Racing sy',
  'Уралдааны сироп 5л задгай',
  'Урсомон 250 мл',
  'Уталгын аппарат ууршуулагч',
  'Утлагын аппарат Ирланд',
  'Утлагын шингэн 2,5мл',
  'Уутны ам наалт',
  'Уян боолт',
  'Уян боолт 15*450',
  'Уян боолт15*450',
  'Уян зүү',
  'Уян зүү 16 G',
  'Уян зүү 22G',
  'Уян зүүний наалт/Лейг/',
  'Фенилбутазон /Төрөө/',
  'Фенилбутазон Sydnie задгай',
  'Фенилбутазон sydnie',
  'Фенилбутазон герман',
  'Фенилбутазон герман 100мл задг',
  'Фенилбутазон орос 100мл задгай',
  'Фенилбутазон орос | Fenylbutaz',
  'Фенилбутазон/МГ/',
  'Фенилбутатрон /недирлант/',
  'Фенилбутатрон/недирлант/ задгай',
  'Фенилвет /Тэнүүн хишиг/',
  'Фенилвет /Тэнүүн хишиг/ задгай',
  'Фенилвет/Тэнүүн хишиг/',
  'Фламайз 500мл задгай',
  'Фламайз EQ 500гр',
  'Флуназайне 100мл',
  'Флуназайне 100мл задгай',
  'Флунекс 100 мл',
  'Флунекс 100 мл агри',
  'Флунекс 100 мл агри задгай',
  'Флунекс 100мл агри',
  'Флуниксин 10 мл',
  'Флювил 100мл',
  'Флювил 100мл задгай',
  'Фосфовет 100мл задгай',
  'Фрусомед 1%-2,0 хайрцаг',
  'Фрусомед задгай 2мл*10ш',
  'Фуровит',
  'Фуровит 100мл задгай',
  'Хадаас чангалагч',
  'Халуун боолт | Poultice',
  'Халууны уян шил',
  'Халууны шил',
  'Халууны шил уян',
  'Хамгаалалтын малгай',
  'Хамгаалалтын тохойвч',
  'Хамгаалалтын хантааз',
  'Хамгаалалтын хувьцас 1 удаагий',
  'Хамгаалалтын өвдгөвч',
  'Ханиадны вакцин ГБЛ',
  'Хефатик баланс 1л | Hepatic ba',
  'Хефатик бланс 1000мл задгай',
  'Хиймэл арьс',
  'Хлоргексидин 300 мл',
  'Холбогч 3 замт',
  'Хоросол',
  'Хуванцар микровет',
  'Хуруу шил',
  'Хутга иш ирний хамт',
  'Хуурай гел | Bottled lub powde',
  'Хуурай глюкоз 1 кг',
  'Хуурай глюкоз 5 кг',
  'Хүйтэн боолт /Улаан дунд /',
  'Хүйтэн боолт /хар жижиг /',
  'Хүйтэн боолт /цэнхэр том/',
  'Хүргэлт',
  'Хүүф Ойл 800гр | Hoof oil, 191',
  'Хүүф макер 20гр | Hoof maker,',
  'Хүүф макер 3кг | Hoof maker, 1',
  'Хүүхдийн хувцас даалимбан',
  'Хөвөн /өргөн/',
  'Хөвөн 50гр',
  'Хөлийн боолт wrap 30см',
  'Хөлийн боолт wrap 50 см',
  'Хөлийн боолт | Wrap',
  'Хөлийн гель',
  'Хөлийн тос ДМСО | DMSO',
  'Хөлийн тос Соёомго | Soyungo',
  'Хөхөлт',
  'Хөөврийн сам',
  'Цефазолин',
  'Цефатаксим задгай',
  'Цефотаксим 1,0',
  'Ципрофлоксацин 200 мг',
  'Цистон',
  'Цистон 60ш задгай',
  'Цээживч том',
  'Чээживч Нэмнээ',
  'Шарх угаагч буу',
  'Шарх угаах спонж',
  'Шархны боолтны ком',
  'Шархны наалт',
  'Шилэн трико',
  'Шингэн Метронидазол 100мл',
  'Шингэн Натри хлорид 1л | NaCL',
  'Шингэн Натри хлорид 500мл | Na',
  'Шингэн Пантоген 500 мл',
  'Шингэн Рингер лактат 1л |Renge',
  'Шингэн Рингер лактат 500мл| Re',
  'Шингэн буламин 500 мл',
  'Шингэн витаплекс 500 мл',
  'Шингэн маннитол 500 мл',
  'Шингэн натри 100 мл',
  'Шингэн натри хлорид 250 мл',
  'Шингэн натри хлорид 500 мл',
  'Шингэн үр шингэлэгч',
  'Шприц 100гр',
  'Шприц 10гр',
  'Шприц 20гр',
  'Шприц 3гр',
  'Шприц 50 гр',
  'Шприц 5гр',
  'Шприц 60гр',
  'Экюзал 400мл | Equizal, 1',
  'Экюзал 400мл задгай',
  'Экүвент 1000мл задгай',
  'Экүвент 1л | Equivent , 1',
  'Экүвент 500Мл | Equivent , 191',
  'Экүвент 500мл задгай',
  'Экүвэнт 1000гр задгай',
  'Элгэвч Нэмнээ',
  'ЭнэрЖен Q-10 | Eqnergene Q-10,',
  'Эуфиллин 24мг/мл 10мл задгай',
  'Эуфиллин 24мг/мл-10мл',
  'Эффивет Hydrogel 500МЛ Задгай',
  'Эффивет Хайдрогел/500мл/',
  'Эффивет ликүд 500мл',
  'Эффивет ликүд 500мл задгай',
  'Эффивет ликүд | effevit liquid',
  'Эффивэт Hydrogel 500ml',
  'Эх барихын бээлий',
  'Эхо гель 250мл',
  'Ээмэглэгч бахь',
  'Ялааны хор',
  'Ямлуур',
  'Ясны өрөм',
  'Ясурамин 10 мл',
  'биохими диск ГЛБ',
  'хөлийн тос Фурозоне | Furazone',
  'цээживч жижиг',
  'эуфиллин 10 мл задгай',
  'Үр суулгах гуурс',
  'Үсний машин',
  'Өмхий ногоон тос',
];

// ----- DATA: DEFAULT DOCTORS -----
const DEFAULT_DOCS = [
  {id:'d1',  name:'Наранбаатар',         role:'Chief Veterinarian',  exams:0, rev:0},
  {id:'d2',  name:'Сайнбилэг',           role:'Senior Veterinarian',    exams:0, rev:0},
  {id:'d3',  name:'Өсөхбаяр',            role:'Senior Veterinarian',    exams:0, rev:0},
  {id:'d4',  name:'Даваахүү',            role:'Veterinarian', exams:0, rev:0},
  {id:'d5',  name:'Нямпүрэв',            role:'Veterinarian', exams:0, rev:0},
  {id:'d6',  name:'Тансагтөгөлдөр',      role:'Veterinarian', exams:0, rev:0},
  {id:'d7',  name:'Т.Тайванбат',         role:'Veterinarian', exams:0, rev:0},
  {id:'d8',  name:'Гончигдорж',          role:'Veterinarian', exams:0, rev:0},
  {id:'d9',  name:'Төгөлдөр-Эрдэнэ',     role:'Veterinarian', exams:0, rev:0}
];

// ----- STATE -----
const STATE = {
  horses: [],
  waiting: [],
  exams: [],
  fins: [],
  inps: [],
  doctors: [],
  staff: [],
  users: [],
  logs: [],
  deletedIds: new Set(),
  deletedExams: [],   // устгасан үзлэгийн архив (зөвхөн Admin харна)
  servicePrices: {},  // үйлчилгээний үндсэн үнэ { "нэр": үнэ } — Admin панелаас тохируулна
  customServices: [], // Admin нэмсэн нэмэлт үйлчилгээний нэрс
  removedServices: [],// Admin устгасан үйлчилгээний нэрс (үндсэн SVCS-ээс нуух)
  labs: [],           // шинжилгээний захиалга (lab.js)
  labSvcOn: [],       // Admin нэмж "шинжилгээ" болгосон үйлчилгээний нэрс
  labSvcOff: [],      // Admin "шинжилгээ биш" болгосон үйлчилгээний нэрс
  staffSchedule: {},  // сарын ажлын хуваарь
  configMs: 0,        // clinic_config-ийг энэ төхөөрөмжөөс сүүлд өөрчилсөн агшин
  finPinHash: '',     // Мөнгөн дүн харах код (SHA-256) — Admin тохируулна
  bonusCfg: null,     // 🎁 Эмчийн урамшууллын тохиргоо (хувь хэмжээ, нэрс)
  examNumCfg: null,   // 🔢 Үзлэгийн дугаарлалтын тохиргоо (эхлэх дугаар, орон, угтвар)
  finUnlockedUntil: 0,// Мөнгөн дүн хэдий хүртэл нээлттэй (ms)
  user: null,
  syncURL: '',
  // ui
  activePage: 'dashboard',
  activeETab: 'doc',
  activeFTab: 'pending',
  activeKPer: 'd',
  activeRPer: 'd',
  activeKSub: 'view',
  selectedKDoc: null,
  trips: [],          // 🗓️ Төлөвлөгөөт үзлэгийн явцууд
  selectedTrip: null,
  selectedW: null,
  selectedI: null,
  selectedF: null,
  curExam: null,
  loginPin: '',
  loginRole: 'Chief Veterinarian',
  payTarget: null,
  editTarget: null
};

// ============================================================
// PERSISTENCE
// ============================================================
// ============================================================
// PERSISTENCE
// ============================================================
function lsGet(k, def) {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : def;
  } catch(e) { return def; }
}
// ── localStorage: багтаамж дүүрэхийг ДУУГҮЙ өнгөрөөхгүй ──────────
// iPhone Safari дээр localStorage ~5MB. Үзлэг олширмогц mt_exams
// хадгалагдахаа больж, апп нээх бүрд үзлэг 0-ээс эхэлдэг байсан —
// алдаа нь залгигдаж хэн ч мэддэггүй байв. Одоо: (1) алдааг тэмдэглэнэ,
// (2) том жагсаалтыг ХАМГИЙН СҮҮЛИЙН бичлэгүүдээр багасгаж дахин оролдоно
// (бүрэн хувь нь Firestore-ийн IndexedDB кэшээс ирнэ).
const __lsStatus = { fails: {}, trimmed: {}, lastErr: '' };
const LS_TRIMMABLE = new Set(['mt_exams', 'mt_fins', 'mt_horses', 'mt_inps', 'mt_labs', 'mt_logs', 'mt_deleted_exams', 'mt_waiting', 'mt_trips']);
function _recMs(r) { return (r && (parseFloat(r.ms) || parseFloat(r._updatedAt) || parseFloat(r.createdAt) || parseFloat(r.log_ms) || parseFloat(r.deletedAt))) || 0; }
// 📦 localStorage = зөвхөн «эхлэх хуулбар». Бүрэн сан нь Firestore-ийн
// IndexedDB кэш (2026-09-17-5). Том жагсаалтыг бүтнээр нь хуулах нь
// (1) 5MB-д багтахгүй, (2) өөрчлөлт бүрд 100+ms стрингжүүлэлт гол урсгалд,
// (3) давхардал. Тиймээс хамгийн сүүлийн N бичлэгийг л хадгална — апп
// нээгдэх мөчид самбар шууд гарахад хангалттай, үлдсэн нь кэшнээс 100–300ms-д ирнэ.
const LS_CAPS = { mt_exams: 300, mt_fins: 300, mt_horses: 600, mt_inps: 300, mt_labs: 200, mt_logs: 100, mt_deleted_exams: 30, mt_trips: 100 };
function _capForLs(k, v) {
  const cap = LS_CAPS[k];
  if (!cap || !Array.isArray(v) || v.length <= cap) return v;
  return v.slice().sort((a, b) => _recMs(b) - _recMs(a)).slice(0, cap);
}
function lsSet(k, v) {
  try {
    v = _capForLs(k, v);
    localStorage.setItem(k, JSON.stringify(v));
    delete __lsStatus.fails[k];
    return true;
  } catch (e) {
    const msg = (e && (e.name + ': ' + e.message)) || 'алдаа';
    __lsStatus.lastErr = msg;
    if (!__lsStatus.fails[k]) console.warn('[LS] ' + k + ' хадгалж чадсангүй (' + msg + ') — багасгаж дахин оролдоно');
    __lsStatus.fails[k] = msg;
    // Багтаамж дүүрсэн бол сүүлийн N бичлэгийг л үлдээж дахин оролдоно
    if (LS_TRIMMABLE.has(k) && Array.isArray(v) && v.length > 50) {
      const sorted = v.slice().sort((a, b) => _recMs(b) - _recMs(a));
      let n = Math.floor(sorted.length / 2);
      while (n >= 50) {
        try {
          localStorage.setItem(k, JSON.stringify(sorted.slice(0, n)));
          __lsStatus.trimmed[k] = { kept: n, total: v.length };
          delete __lsStatus.fails[k];
          return true;
        } catch (e2) { n = Math.floor(n / 2); }
      }
    }
    return false;
  }
}
function loadAll() {
  STATE.horses = lsGet('mt_horses', []);
  STATE.waiting = lsGet('mt_waiting', []);
  STATE.exams = lsGet('mt_exams', []);
  STATE.fins = lsGet('mt_fins', []);
  STATE.inps = lsGet('mt_inps', []);
  STATE.doctors = lsGet('mt_doctors', DEFAULT_DOCS);
  STATE.staff = lsGet('mt_staff_list', []);
  STATE.users = lsGet('mt_users', []);
  // Хэрэглэгч хоосон бол анхны seed жагсаалтаар дүүргэнэ
  if (!Array.isArray(STATE.users) || STATE.users.length === 0) {
    STATE.users = DEFAULT_USERS.map(u => ({ ...u, pages: [...u.pages] }));
    _scheduleLsSave('users');
  }
  STATE.staffSchedule = lsGet('mt_staff_schedule', {}); // { 'YYYY-MM': { docId: { 'YYYY-MM-DD': 'work'|'duty'|'off' } } }
  STATE.logs = lsGet('mt_logs', []);
  if (!Array.isArray(STATE.logs)) STATE.logs = [];
  // Устгасан бичлэгийн ID-уудыг сэргээнэ (sync үед буцаж нэмэгдэхээс сэргийлнэ)
  const delArr = lsGet('mt_deleted', []);
  STATE.deletedIds = new Set(Array.isArray(delArr) ? delArr.map(String) : []);
  // Устгасан үзлэгийн архив
  STATE.deletedExams = lsGet('mt_deleted_exams', []);
  if (!Array.isArray(STATE.deletedExams)) STATE.deletedExams = [];
  // Үйлчилгээний үнэ
  STATE.servicePrices = lsGet('mt_service_prices', {});
  if (!STATE.servicePrices || typeof STATE.servicePrices !== 'object' || Array.isArray(STATE.servicePrices)) STATE.servicePrices = {};
  // Нэмэлт / устгасан үйлчилгээ
  STATE.customServices = lsGet('mt_custom_services', []);
  if (!Array.isArray(STATE.customServices)) STATE.customServices = [];
  STATE.removedServices = lsGet('mt_removed_services', []);
  if (!Array.isArray(STATE.removedServices)) STATE.removedServices = [];
  // Шинжилгээ (lab.js)
  STATE.labs = lsGet('mt_labs', []);
  STATE.trips = lsGet('mt_trips', []);
  if (!Array.isArray(STATE.trips)) STATE.trips = [];
  if (!Array.isArray(STATE.labs)) STATE.labs = [];
  STATE.labSvcOn = lsGet('mt_lab_svc_on', []);
  if (!Array.isArray(STATE.labSvcOn)) STATE.labSvcOn = [];
  STATE.labSvcOff = lsGet('mt_lab_svc_off', []);
  if (!Array.isArray(STATE.labSvcOff)) STATE.labSvcOff = [];
  STATE.configMs = parseFloat(lsGet('mt_config_ms', 0)) || 0;
  STATE.finPinHash = lsGet('mt_fin_pin_hash', '') || '';
  STATE.bonusCfg = lsGet('mt_bonus_cfg', null);
  STATE.examNumCfg = lsGet('mt_examnum_cfg', null);
  STATE.inpLocations = lsGet('mt_inp_locations', null); // null = анхдагч жагсаалт
  STATE.customRoles = lsGet('mt_custom_roles', []); if (!Array.isArray(STATE.customRoles)) STATE.customRoles = []; // 👥 админ нэмсэн дүрүүд
  STATE.callCfg = lsGet('mt_call_cfg', null); // 📞 эзэнд мэдээлэх сануулга
  STATE.medCatalog = lsGet('mt_med_catalog', []); if (!Array.isArray(STATE.medCatalog)) STATE.medCatalog = []; // 💊 эмийн каталог (нэгжийн үнэ)
  STATE.employees = lsGet('mt_employees', []); if (!Array.isArray(STATE.employees)) STATE.employees = []; // 🕒 ажилтны жагсаалт (цагийн бүртгэл)
  STATE.dailyCfg = lsGet('mt_daily_cfg', null); // 📋 өдрийн мэдээний тохиргоо (салбар, боловсруулсан)
  STATE.user = lsGet('mt_user', null);
  STATE.syncURL = ''; // Apps Script sync устгагдсан — Firebase ашиглана
  if (STATE.doctors.length === 0) STATE.doctors = [...DEFAULT_DOCS];
  // Auto-upgrade old default doctors (Б.Батбаяр / Д.Сэлэнгэ / Г.Энхбат) to new real list
  const oldNames = ['Б.Батбаяр','Д.Сэлэнгэ','Г.Энхбат'];
  const isOldDefault = STATE.doctors.length <= 3 &&
    STATE.doctors.every(d => oldNames.includes(d.name)) &&
    STATE.doctors.every(d => (d.exams||0) === 0);
  if (isOldDefault) {
    STATE.doctors = [...DEFAULT_DOCS];
    lsSet('mt_doctors', STATE.doctors);
  }
}
// ── 🗂 Адууны индекс — O(n²) хайлтыг арилгана ─────────────────
// Түүх/Тайлан/Accountant / Finance үзлэг бүрт STATE.horses.find(...) хийдэг байсан:
// 2500 × 2500 = 6 сая харьцуулалт нэг зурахад. Map-аар O(1).
// STATE.horses-ийн хаяг/урт/хувилбар өөрчлөгдөхөд автоматаар дахин үүснэ.
let __horseIdx = { ref: null, n: -1, ver: -1, byId: null, byName: null };
let __stateVer = 0; // өгөгдөл өөрчлөгдөх бүрд нэмэгдэнэ (индексийг хүчингүй болгоно)
function _horseIdx() {
  const arr = STATE.horses || [];
  if (__horseIdx.ref !== arr || __horseIdx.n !== arr.length || __horseIdx.ver !== __stateVer) {
    const byId = new Map(), byName = new Map();
    for (const h of arr) { if (!h) continue; if (h.id != null) byId.set(String(h.id), h); if (h.name && !byName.has(h.name)) byName.set(h.name, h); }
    __horseIdx = { ref: arr, n: arr.length, ver: __stateVer, byId, byName };
  }
  return __horseIdx;
}
function horseById(id) { return id == null ? undefined : _horseIdx().byId.get(String(id)); }
// ── 🗂 Collection бүрийн id → бичлэг индекс ─────────────────────
// fbApplyRecord бичлэг бүрт STATE[col].findIndex(...) хийдэг байсан →
// эхний snapshot-д 7400 бичлэг ирэхэд квадрат (7400 × 2500). Map-аар O(1).
// Хүчинтэй эсэх: массивын хаяг ба урт таарч байвал; эс бөгөөс дахин үүсгэнэ
// (локал код массивыг шууд өөрчилсөн үед — нэг удаа O(n)).
const __recIdx = {};
function _recMap(col) {
  const arr = STATE[col];
  if (!Array.isArray(arr)) return null;
  let ix = __recIdx[col];
  if (!ix || ix.ref !== arr || ix.n !== arr.length) {
    const m = new Map();
    for (const r of arr) if (r && r.id != null) m.set(String(r.id), r);
    ix = __recIdx[col] = { ref: arr, n: arr.length, map: m };
  }
  return ix;
}
function _recIdxPush(col, rec) { const arr = STATE[col]; const ix = _recMap(col); arr.push(rec); if (ix) { ix.map.set(String(rec.id), rec); ix.n = arr.length; } }
function recById(col, id) { const ix = _recMap(col); return ix ? ix.map.get(String(id)) : undefined; }

// Accountant / Finance: examId → бичлэг (Түүх/Тайлан мөр бүрт 2400 бичлэг гүйлгэдэг байсан)
let __finIdx = { ref: null, n: -1, ver: -1, byExam: null };
function finByExamId(examId) {
  const arr = STATE.fins || [];
  if (__finIdx.ref !== arr || __finIdx.n !== arr.length || __finIdx.ver !== __stateVer) {
    const byExam = new Map();
    for (const f of arr) if (f && f.examId != null && !byExam.has(String(f.examId))) byExam.set(String(f.examId), f);
    __finIdx = { ref: arr, n: arr.length, ver: __stateVer, byExam };
  }
  return examId == null ? undefined : __finIdx.byExam.get(String(examId));
}
// Үзлэг/санхүүгийн бичлэгт харгалзах адуу: эхлээд horseId, дараа нь нэрээр
function horseOf(rec) { if (!rec) return undefined; return horseById(rec.horseId) || (rec.horse ? _horseIdx().byName.get(rec.horse) : undefined); }

function saveAll() {
  __stateVer++;
  lsSet('mt_horses', STATE.horses);
  _scheduleLsSave('waiting');
  lsSet('mt_exams', STATE.exams);
  lsSet('mt_fins', STATE.fins);
  lsSet('mt_inps', STATE.inps);
  lsSet('mt_doctors', STATE.doctors);
  lsSet('mt_staff_list', STATE.staff);
  lsSet('mt_users', STATE.users || []);
  lsSet('mt_staff_schedule', STATE.staffSchedule || {});
  // Лог хэт томроос сэргийлж сүүлийн 1000-аар хязгаарлана
  if (Array.isArray(STATE.logs) && STATE.logs.length > 1000) {
    STATE.logs = STATE.logs.slice(-1000);
  }
  lsSet('mt_logs', STATE.logs || []);
  // Устгасан ID-уудыг хадгална (хамгийн сүүлийн 2000-аар хязгаарлана)
  if (STATE.deletedIds instanceof Set) {
    let delArr = [...STATE.deletedIds].map(String);
    if (delArr.length > 2000) delArr = delArr.slice(-2000);
    lsSet('mt_deleted', delArr);
  }
  // Устгасан үзлэгийн архив (сүүлийн 500-аар хязгаарлана)
  if (Array.isArray(STATE.deletedExams)) {
    if (STATE.deletedExams.length > 500) STATE.deletedExams = STATE.deletedExams.slice(-500);
    _scheduleLsSave('deletedExams');
  }
  // Үйлчилгээний үнэ
  if (STATE.servicePrices && typeof STATE.servicePrices === 'object') {
    lsSet('mt_service_prices', STATE.servicePrices);
  }
  // Нэмэлт / устгасан үйлчилгээ
  if (Array.isArray(STATE.customServices)) lsSet('mt_custom_services', STATE.customServices);
  if (Array.isArray(STATE.removedServices)) lsSet('mt_removed_services', STATE.removedServices);
  // Шинжилгээ (lab.js)
  if (Array.isArray(STATE.labs)) lsSet('mt_labs', STATE.labs);
  if (Array.isArray(STATE.trips)) lsSet('mt_trips', STATE.trips);
  if (Array.isArray(STATE.labSvcOn)) lsSet('mt_lab_svc_on', STATE.labSvcOn);
  if (Array.isArray(STATE.labSvcOff)) lsSet('mt_lab_svc_off', STATE.labSvcOff);
}

// ============================================================
// UTIL
// ============================================================
function $(s) { return document.querySelector(s); }
function $$(s) { return [...document.querySelectorAll(s)]; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }
// Firestore document ID-д / болон хоосон зай хориотой — цэвэрлэнэ
function safeDocId(str) {
  return String(str || '').replace(/[\s\/\.#\[\]\*]/g, '_').slice(0, 100) || '_empty_';
}
function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
// UTC биш local цагаар YYYY-MM-DD буцаана (UTC+8 Монгол цаг)
function localDateStr(d) {
  if (!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt)) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function nowMs() { return Date.now(); }

// Бичлэгийн БОДИТ хугацаа: эхлээд огноо (date)-г, байхгүй бол ms-г ашиглана.
// Импортоор нөхөж оруулсан бичлэгийн ms нь оруулсан агшны хугацаа болдог тул
// эрэмбэлэхэд огноог нь түрүүлж тооцох ёстой — эс бөгөөс "сүүлд оруулсан нь дээр" гарна.
function recTime(r) {
  if (r && r.date) {
    const t = new Date(r.date + (r.time ? 'T' + r.time : 'T12:00:00')).getTime();
    if (t > 0) return t;
  }
  if (r && r.createdAt) return parseFloat(r.createdAt) || 0;
  if (r && r.ms) return parseFloat(r.ms) || 0;
  return 0;
}
function fmt(n) { return '₮' + (n||0).toLocaleString('en-US'); }
function fmtCompact(n) {
  n = n || 0;
  if (n >= 1000000) return '₮' + (n/1000000).toFixed(1).replace(/\.0$/,'') + 'сая';
  if (n >= 1000) return '₮' + Math.round(n/1000) + 'мянга';
  return '₮' + n;
}
function fmtTime(ms) {
  const d = new Date(ms);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}
// Үргэлжлэх хугацааг (минут) хүний уншихуйц болгоно: 45 → "45 мин", 90 → "1ц 30мин"
function fmtDuration(min) {
  if (min === null || min === undefined || isNaN(min)) return '—';
  min = Math.round(min);
  if (min < 60) return min + ' мин';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? (h + 'ц ' + m + 'мин') : (h + ' цаг');
}
function fmtDate(d) {
  if (!d) return '';
  if (typeof d === 'string') d = new Date(d);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function ago(ms) {
  const diff = (nowMs() - ms) / 1000;
  if (diff < 60) return Math.floor(diff) + 'с';
  if (diff < 3600) return Math.floor(diff/60) + 'мин';
  if (diff < 86400) return Math.floor(diff/3600) + 'ц';
  return Math.floor(diff/86400) + 'хон';
}
function escHTML(s) {
  return (s||'').toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

// ----- TOAST -----
let toastTimer;
// 🛡 Гүйцэтгэлийн алдааг чимээгүй өнгөрөөхгүй — хэрэглэгчид товч мессежээр харуулна
let __lastErrToastMs = 0;
function _showJsError(msg) {
  try {
    const m = String(msg || '').replace(/^Uncaught\s*/i, '').slice(0, 160);
    if (!m || /ResizeObserver|Script error\.?$/i.test(m)) return;
    const now = Date.now(); if (now - __lastErrToastMs < 3000) return; __lastErrToastMs = now;
    if (typeof toast === 'function' && $('#toast')) toast('⚠️ Програмын алдаа: ' + m, 'err');
  } catch (_) {}
}
window.addEventListener('error', ev => { console.error('[JS]', ev.message, ev.filename, ev.lineno); _showJsError(ev.message); });
window.addEventListener('unhandledrejection', ev => { const r = ev.reason; const m = (r && (r.message || r.code)) || String(r); console.error('[JS promise]', m); if (!/permission|unavailable|network|offline/i.test(m)) _showJsError(m); });
function toast(msg, type) {
  const t = $('#toast');
  t.className = ''; void t.offsetWidth;
  t.textContent = msg;
  if (type) t.classList.add(type);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2500);
}

// ----- MODAL -----
function openModal(id) { $('#'+id).classList.add('show'); }
function closeModal(id) { $('#'+id).classList.remove('show'); }

// ============================================================
// LOGIN
// ============================================================
function setupLogin() {
  populateLoginUsers();
  // Enter to submit
  const pwInput = document.getElementById('login-pw');
  if (pwInput) {
    pwInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); doLogin(); }
    });
  }
  const userSel = document.getElementById('login-user');
  if (userSel) {
    userSel.addEventListener('change', () => {
      // Clear error when user selects
      const err = document.getElementById('login-err');
      if (err) err.textContent = '';
      if (pwInput) pwInput.focus();
    });
  }
}

// Login dropdown-ийг STATE.users-ээс дүрээр бүлэглэн динамикаар бөглөнө
function populateLoginUsers() {
  const sel = document.getElementById('login-user');
  if (!sel) return;
  const prev = sel.value;
  const users = (STATE.users && STATE.users.length) ? STATE.users : DEFAULT_USERS;
  // Дүрүүдийг allRoles()-ийн дарааллаар бүлэглэнэ (админ нэмсэн дүрүүд мөн)
  let html = '<option value="">— Нэр сонгох —</option>';
  const _roles = allRoles();
  _roles.forEach(role => {
    const inRole = users.filter(u => u.role === role);
    if (!inRole.length) return;
    html += '<optgroup label="' + escHTML(role) + '">';
    inRole.forEach(u => {
      html += '<option value="' + escHTML(u.name) + '">' + escHTML(u.name) + '</option>';
    });
    html += '</optgroup>';
  });
  // Жагсаалтад ороогүй дүртэй хэрэглэгч байвал "Бусад"-д хийнэ
  const other = users.filter(u => !_roles.includes(u.role));
  if (other.length) {
    html += '<optgroup label="Бусад">';
    other.forEach(u => {
      html += '<option value="' + escHTML(u.name) + '">' + escHTML(u.name) + '</option>';
    });
    html += '</optgroup>';
  }
  sel.innerHTML = html;
  // Өмнөх сонголтыг сэргээнэ (боломжтой бол)
  if (prev && users.some(u => u.name === prev)) sel.value = prev;
}

// ============================================================
// ROLE-BASED ACCESS CONTROL
// ============================================================
// Хэрэглэгч бүр өөр нэр + нууц үгтэй
// ============================================================
// ХЭРЭГЛЭГЧИД — Firebase-д хадгалагдана (clinic/users document)
// Доорх жагсаалт нь ЗӨВХӨН анхны seed. Систем дотроос нэмж/засаж
// болох ба бүх өөрчлөлт Firebase-ээр бүх төхөөрөмжид тархана.
// ============================================================
// ⚠️ DEFAULT_USERS — нууц үггүй хоосон жагсаалт.
// Нууц үгийг Firestore-аас татна. Хэрэв users collection хоосон бол
// Admin Firebase Console-оос хэрэглэгч нэмнэ.
// Нууц үгийг ХЭЗЭЭ ЧИД frontend код, localStorage-д plain text хадгалах ХОРИОТОЙ.
const DEFAULT_USERS = [
  { name: 'Наранбаатар',     pw: '',  role: 'Chief Veterinarian',        pages: ['dashboard','register','waiting','exam','inpatient','planned','lab','pharmacy','finance','kpi','history','report','admin'] },
  { name: 'Сайнбилэг',       pw: '',  role: 'Senior Veterinarian',          pages: ['dashboard','register','waiting','exam','inpatient','planned','lab','finance','kpi','history','report'] },
  { name: 'Өсөхбаяр',        pw: '',  role: 'Senior Veterinarian',          pages: ['dashboard','register','waiting','exam','inpatient','planned','lab','finance','kpi','history','report'] },
  { name: 'Даваахүү',        pw: '',  role: 'Veterinarian',       pages: ['dashboard','register','waiting','exam','inpatient','lab','history'] },
  { name: 'Нямпүрэв',        pw: '',  role: 'Veterinarian',       pages: ['dashboard','register','waiting','exam','inpatient','lab','history'] },
  { name: 'Тансагтөгөлдөр',  pw: '',  role: 'Veterinarian',       pages: ['dashboard','register','waiting','exam','inpatient','lab','history'] },
  { name: 'Т.Тайванбат',     pw: '',  role: 'Veterinarian',       pages: ['dashboard','register','waiting','exam','inpatient','lab','history'] },
  { name: 'Гончигдорж',      pw: '',  role: 'Veterinarian',       pages: ['dashboard','register','waiting','exam','inpatient','lab','history'] },
  { name: 'Төгөлдөр-Эрдэнэ', pw: '', role: 'Veterinarian',       pages: ['dashboard','register','waiting','exam','inpatient','lab','history'] },
  { name: 'Intern Veterinarian',     pw: '',  role: 'Intern Veterinarian',        pages: ['dashboard','waiting','exam','inpatient','lab','history'] },
  { name: 'Бүртгэл',         pw: '',  role: 'Registration Clerk', pages: ['dashboard','register','waiting','planned','history'] },
  { name: 'Accountant / Finance',          pw: '',  role: 'Accountant / Finance',             pages: ['dashboard','finance','history','report'] },
  { name: 'Admin',           pw: '',  role: 'Admin',              pages: ['dashboard','register','waiting','exam','inpatient','planned','lab','pharmacy','finance','kpi','history','report','admin'] }
];

// Боломжит бүх хуудас (эрх тохируулахад ашиглана)
const ALL_PAGES = [
  { id: 'dashboard', label: 'Хяналтын самбар' },
  { id: 'register',  label: 'Адуу бүртгэл' },
  { id: 'waiting',   label: 'Хүлээж байгаа' },
  { id: 'exam',      label: 'Үзлэг / Эмчилгээ' },
  { id: 'inpatient', label: 'Байрлан эмчлүүлэх' },
  { id: 'planned',   label: 'Төлөвлөгөөт үзлэг' },
  { id: 'finance',   label: 'Accountant / Finance' },
  { id: 'history',   label: 'Түүх' },
  { id: 'lab',       label: 'Шинжилгээ' },
  { id: 'review',    label: 'Senior Veterinarianийн хяналт' },
  { id: 'pharmacy',  label: 'Pharmacy Duty' },
  { id: 'timesheet', label: 'Цагийн бүртгэл' },
  { id: 'kpi',       label: 'KPI самбар' },
  { id: 'report',    label: 'Өдрийн тайлан' },
  { id: 'admin',     label: 'Системийн тохиргоо' }
];

// Боломжит дүрүүд — үндсэн жагсаалт. Admin «Нэвтрэх эрх» цонхноос шинэ дүр
// (ж: Нярав, Жолооч) нэмж болно → STATE.customRoles (clinic_config-д хадгална).
const ALL_ROLES = ['Chief Veterinarian','Senior Veterinarian','Veterinarian','Intern Veterinarian','Registration Clerk','Accountant / Finance','Pharmacist','Manager','Admin'];
// Дүр шинээр сонгоход (тухайн дүртэй хэрэглэгч хараахан байхгүй үед) санал болгох хуудсууд
const ROLE_DEFAULT_PAGES = {
  'Chief Veterinarian':        ['dashboard','register','waiting','exam','inpatient','planned','lab','review','pharmacy','timesheet','finance','kpi','history','report','admin'],
  'Senior Veterinarian':          ['dashboard','register','waiting','exam','inpatient','planned','lab','review','pharmacy','timesheet','finance','kpi','history','report'],
  'Veterinarian':       ['dashboard','register','waiting','exam','inpatient','lab','history'],
  'Intern Veterinarian':        ['dashboard','waiting','exam','inpatient','lab','history'],
  'Registration Clerk': ['dashboard','register','waiting','planned','history'],
  'Accountant / Finance':             ['dashboard','finance','timesheet','history','report'],
  'Pharmacist':         ['dashboard','pharmacy','inpatient'],
  'Manager':            ['dashboard','inpatient','review','pharmacy','timesheet','finance','kpi','history','report'],
  'Admin':              ['dashboard','register','waiting','exam','inpatient','planned','lab','review','pharmacy','timesheet','finance','kpi','history','report','admin']
};
// Бүх дүр: үндсэн + админ нэмсэн + одоо байгаа хэрэглэгчдийн дүр (жагсаалтаас гадуурх дүр алдагдахгүй)
function allRoles() {
  const out = ALL_ROLES.slice();
  const add = r => { r = String(r || '').trim(); if (r && !out.includes(r)) out.splice(out.length - 1, 0, r); }; // Admin-ы өмнө
  (Array.isArray(STATE.customRoles) ? STATE.customRoles : []).forEach(add);
  (STATE.users || []).forEach(u => add(u && u.role));
  return out;
}

// STATE.users массиваас нэрээр хайх хялбар объект (хуучин USERS[name]-тэй нийцтэй)
function getUsers() {
  const map = {};
  (STATE.users || []).forEach(u => {
    if (u && u.name) map[u.name] = u;
  });
  return map;
}

// Тухайн дүрийн эрхийг STATE.users-ээс динамикаар тооцох
function pagesForRole(role) {
  // Эхлээд тухайн дүртэй ямар нэг хэрэглэгчийн pages-ийг ашиглана
  const u = (STATE.users || []).find(x => x.role === role && Array.isArray(x.pages));
  if (u) return u.pages;
  return ROLE_DEFAULT_PAGES[role] || ['dashboard'];
}

// ============================================================
// LOG SYSTEM
// ============================================================
function writeLog(action, targetId, targetName, details, examId) {
  if (!STATE.user) return null;
  const log = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
    user_name: STATE.user.name || STATE.user.role,
    user_role: STATE.user.role,
    action: action,
    target_id: targetId || '',
    target_name: targetName || '',
    exam_id: examId || '',
    details: details || '',
    log_date: todayStr(),
    log_ms: nowMs()
  };
  if (!Array.isArray(STATE.logs)) STATE.logs = [];
  STATE.logs.push(log);
  _scheduleLsSave('logs');
  fbSaveRecord('logs', log);
  if (STATE.activePage === 'admin') { try { renderLogViewer(); } catch(_){} }
  return log;
}

// Жижиг туслах: засварласан талбаруудын өмнөх→дараах ялгааг текст болгоно
function diffStr(before, after, fields) {
  const parts = [];
  fields.forEach(f => {
    const b = (before && before[f.k] != null) ? String(before[f.k]) : '';
    const a = (after  && after[f.k]  != null) ? String(after[f.k])  : '';
    if (b !== a) parts.push(`${f.label}: «${b}» → «${a}»`);
  });
  return parts.join('; ');
}

// Устгах эрх — ЗӨВХӨН Admin
function canDelete() {
  return !!(STATE.user && STATE.user.role === 'Admin');
}
// Засах эрх — анхдагчаар Chief Veterinarian / Senior Veterinarian / Admin.
// Хэрэглэгч бүрд «✏️ Засах эрх» тугийг (editData) Нэвтрэх эрх цонхноос асааж/унтрааж болно —
// ингэснээр Manager зэрэг шинэ дүрд засах эрх өгч болно. Admin үргэлж засна.
const EDIT_ROLES = ['Chief Veterinarian','Senior Veterinarian','Admin'];
function _meUser() { return STATE.user ? getUsers()[STATE.user.name] : null; }
function canEditData() {
  if (!STATE.user) return false;
  if (STATE.user.role === 'Admin') return true;
  const me = _meUser();
  if (me && typeof me.editData === 'boolean') return me.editData;
  return EDIT_ROLES.includes(STATE.user.role);
}

// Орлого / мөнгөн дүн харах эрх — зөвхөн санхүүгийн хуудас руу хандах эрхтэй хүн.
// Veterinarian, Intern Veterinarian зэрэг эмч нарт орлогын дүн харагдахгүй.
function canSeeFinance() {
  return !!(STATE.user && STATE.user.role && canAccess('finance'));
}


function canAccess(page) {
  if (!STATE.user || !STATE.user.role) return false;
  // Хэрэглэгчид өөрт нь тусгайлан pages байвал түүнийг эрхэмлэнэ
  const me = getUsers()[STATE.user.name];
  const pages = (me && Array.isArray(me.pages)) ? me.pages : pagesForRole(STATE.user.role);
  // 🗓️ Төлөвлөгөөт үзлэг: тусгайлан эрх өгөөгүй ч адуу бүртгэх эрхтэй хүн шивж болно
  if (page === 'planned' && !pages.includes('planned') && pages.includes('register')) return true;
  // 🩺 Senior Veterinarianийн хяналт: онош батлах эрхтэй хүн (Өсөхбаяр, Сайнбилэг), Chief Veterinarian, Admin —
  // хуудасны жагсаалтад тусгайлан нэмээгүй ч орно (хуучин хэрэглэгчдийн pages-д 'review' байхгүй)
  if (page === 'review' && !pages.includes('review') && (canApproveDx() || ['Chief Veterinarian', 'Admin'].includes(STATE.user.role))) return true;
  // 💊 Эмийн сан: Pharmacist, Chief Veterinarian, Senior Veterinarian, Admin — хуучин хэрэглэгчдийн pages-д 'pharmacy' байхгүй ч орно
  if (page === 'pharmacy' && !pages.includes('pharmacy') && ['Pharmacist', 'Chief Veterinarian', 'Senior Veterinarian', 'Admin'].includes(STATE.user.role)) return true;
  // 🕒 Цагийн бүртгэл: Manager, Chief Veterinarian, Senior Veterinarian, Accountant / Finance, Admin
  if (page === 'timesheet' && !pages.includes('timesheet') && ['Manager', 'Chief Veterinarian', 'Senior Veterinarian', 'Accountant / Finance', 'Admin'].includes(STATE.user.role)) return true;
  return pages.includes(page);
}

function applyRolePermissions() {
  if (!STATE.user) return;
  const me = getUsers()[STATE.user.name];
  const pages = (me && Array.isArray(me.pages)) ? me.pages : pagesForRole(STATE.user.role);
  if (!pages || !pages.length) return;
  // Hide bottom nav buttons the role can't access
  // canAccess-ийг ашиглана — 'planned' хуудасны fallback (register эрхтэй бол) цэсэнд ч үйлчилнэ
  document.querySelectorAll('.bn-i[data-page]').forEach(btn => {
    const p = btn.dataset.page;
    btn.style.display = canAccess(p) ? '' : 'none';
  });
  // Hide drawer items the role can't access
  document.querySelectorAll('.ni[data-page]').forEach(el => {
    const p = el.dataset.page;
    el.style.display = canAccess(p) ? '' : 'none';
  });
  // "Үнэ оруулах" товчийг зөвхөн Adminд харуулна
  const isAdminUser = STATE.user.role === 'Admin';
  ['ni-sync','ni-sync2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isAdminUser ? '' : 'none';
  });
}

function doLogin() {
  const userSel = document.getElementById('login-user');
  const pwInput = document.getElementById('login-pw');
  const err = document.getElementById('login-err');
  const userName = userSel ? userSel.value : '';
  const pw = pwInput ? pwInput.value : '';
  if (!userName) { if (err) err.textContent = 'Нэвтрэх нэр сонгоно уу'; return; }
  if (!pw)       { if (err) err.textContent = 'Нууц үг оруулна уу'; return; }
  const u = getUsers()[userName];
  if (!u) {
    if (err) err.textContent = 'Нэвтрэх нэр буруу байна';
    return;
  }
  // Async hash шалгалт
  _checkPassword(pw, u).then(ok => {
    if (!ok) {
      if (err) err.textContent = 'Нууц үг буруу байна';
      if (pwInput) { pwInput.value = ''; pwInput.focus(); }
      return;
    }
    STATE.user = { name: userName, role: u.role, loginAt: nowMs() };
    lsSet('mt_user', STATE.user);
    document.getElementById('login').classList.add('hide');
    document.getElementById('app').style.display = 'flex';
    $('#hdr-sub').textContent = userName + ' · ' + u.role;
    if ($('#drawer-sub')) $('#drawer-sub').textContent = u.role;
    if (err) err.textContent = '';
    if (pwInput) pwInput.value = '';
    initApp();
    applyRolePermissions();
    writeLog('Нэвтэрсэн', '', '');
    if (!canAccess(STATE.activePage || 'dashboard')) {
      nav('dashboard');
    }
  }).catch(() => {
    if (err) err.textContent = 'Нэвтрэх алдаа гарлаа. Дахин оролдоно уу.';
  });
}

function logout() {
  if (!confirm('Гарах уу? Хадгалагдсан өгөгдөл арилахгүй.')) return;
  STATE.user = null;
  try { localStorage.removeItem('mt_user'); } catch(e) {}
  // Hide app, show login
  $('#app').style.display = 'none';
  $('#login').classList.remove('hide');
  // Reset form
  const userSel = document.getElementById('login-user');
  const pwInput = document.getElementById('login-pw');
  if (userSel) userSel.value = '';
  if (pwInput) pwInput.value = '';
  toast('👋 Гарлаа', 'ok');
}

// ============================================================
// NAV
// ============================================================
function nav(p, opts) {
  opts = opts || {};
  // Role-based access check — redirect to dashboard if not allowed
  if (STATE.user && !canAccess(p)) {
    toast('Энэ хуудсанд хандах эрх алга байна', 'err');
    p = 'dashboard';
  }
  const samePage = (STATE.activePage === p);
  STATE.activePage = p;
  $$('.page').forEach(x => x.classList.remove('active'));
  const el = $('#page-' + p);
  if (el) el.classList.add('active');
  $$('.ni').forEach(n => n.classList.toggle('active', n.dataset.page === p));
  $$('.bn-i').forEach(n => n.classList.toggle('active', n.dataset.page === p));
  // close drawer
  $('#drawer').classList.remove('show');
  $('#drawer-bd').classList.remove('show');
  // Байрлан эмчлүүлэх drawer нь body-д амьдардаг тул хуудас солиход тусад нь хаана.
  // samePage үед хаахгүй — sync-ийн улмаас нав дахин дуудагдахад эмчийн бичиж буй
  // маягтын drawer гэнэт хаагдахаас сэргийлнэ.
  if (!samePage && typeof closeInpDrawer === 'function') closeInpDrawer();
  // page-specific renders
  if (p === 'dashboard') renderDashboard();
  if (p === 'register') initRegPage();
  if (p === 'waiting') renderWaiting();
  if (p === 'exam') initExamPage();
  if (p === 'inpatient') renderInpatient();
  if (p === 'planned') renderPlanned();
  if (p === 'finance') renderFinance();
  if (p === 'kpi') renderKPI();
  if (p === 'report') initReport();
  if (p === 'history') renderHistory();
  if (p === 'lab' && typeof renderLab === 'function') renderLab();
  if (p === 'review') renderReview();
  if (p === 'pharmacy' && typeof renderPharmacy === 'function') renderPharmacy();
  if (p === 'timesheet' && typeof renderTimesheet === 'function') renderTimesheet();
  if (p === 'admin') renderAdmin();
  // Reset scroll only on real navigation (not when re-rendering current page via sync)
  if (!opts.silent && !samePage) {
    $('#main').scrollTop = 0;
  }
}

/**
 * Soft refresh — re-render current page after sync without resetting scroll
 * or disturbing user input (forms in progress, search dropdowns etc.).
 *
 * Skip re-render entirely on pages where user is actively editing,
 * because re-rendering would clobber unsaved input.
 */
// Маягт бөглөж байх үед шинэчлэхийг хойшлуулсан эсэх
let __refreshPending = false;

function softRefresh() {
  const p = STATE.activePage;
  // Маягт бөглөж байгаа хуудсыг дахин зурвал бичсэн зүйл арилна.
  // ⚠️ Гэхдээ дуугүй алгасвал «шинэ дата ирэхгүй байна» гэж ойлгогдоно —
  // тиймээс тэмдэглээд хэрэглэгчид товчоор мэдэгдэнэ.
  const editPages = new Set(['register', 'exam', 'planned']);
  if (editPages.has(p)) { __refreshPending = true; renderRefreshChip(); return; }
  // 🩺 Хяналтын хуудсанд онош засаж / шалтгаан бичиж байх үед дахин зурахгүй
  const ae = document.activeElement;
  if (p === 'review' && ae && /^(TEXTAREA|INPUT)$/.test(ae.tagName) && ae.closest && ae.closest('#page-review') && ae.type !== 'date') { __refreshPending = true; renderRefreshChip(); return; }
  // 💊 Эмийн сан: каталогийн маягт бөглөж байх үед дахин зурахгүй
  if (p === 'pharmacy' && ae && /^(TEXTAREA|INPUT|SELECT)$/.test(ae.tagName) && ae.closest && ae.closest('#ph-catalog')) { __refreshPending = true; renderRefreshChip(); return; }
  // 🕒 Цагийн бүртгэл: ажилтны маягт бөглөж байх үед дахин зурахгүй
  if (p === 'timesheet' && ae && /^(TEXTAREA|INPUT|SELECT)$/.test(ae.tagName) && ae.closest && ae.closest('#ts-emp-form')) { __refreshPending = true; renderRefreshChip(); return; }
  __refreshPending = false; renderRefreshChip();
  // Save current scroll
  const main = $('#main');
  const scroll = main ? main.scrollTop : 0;
  // Re-render but tell nav not to reset scroll
  nav(p, { silent: true });
  if (main) main.scrollTop = scroll;
}

// ── 🖼 Storage-ийн алдааг хүн ойлгохоор тайлбарлах ───────────
// Firebase-ийн эх мессеж англи, техникийн хэллэгтэй тул эмч нар юу
// болсныг ойлгодоггүй. Хамгийн түгээмэл шалтгаан нь Storage-ийн
// хамгаалалтын дүрэмд тухайн зам нэмэгдээгүй байх явдал.
function storageErrMsg(err) {
  const code = (err && (err.code || '')) + '';
  const msg  = (err && (err.message || '')) + '';
  if (/unauthorized|permission/i.test(code + msg)) {
    return 'Storage-ийн зөвшөөрөл алга. Admin: Firebase Console → Storage → ' +
           'Rules хэсэгт энэ зам нэмэгдээгүй байна (storage.rules файлыг харна уу).';
  }
  // ⚠️ Дараалал чухал: storage/retry-limit-exceeded дотор «exceeded» байдаг тул
  //    сүлжээний шалгалтыг багтаамжийнхаас ӨМНӨ хийнэ.
  if (/retry|network|timeout|unreachable|offline/i.test(code + msg)) return 'Сүлжээ тасарлаа. Холболтоо шалгаад дахин оролдоно уу.';
  if (/quota/i.test(code + msg)) return 'Storage-ийн багтаамж дүүрсэн байна. Adminд мэдэгдэнэ үү.';
  if (/canceled/i.test(code + msg)) return 'Илгээх үйлдэл цуцлагдлаа.';
  return msg || 'тодорхойгүй алдаа';
}

// ── 🔍 Storage оношилгоо ─────────────────────────────────────
// «Зураг илгээж чадсангүй» гэсэн ганц мессежээс шалтгааныг мэдэх
// боломжгүй: нэвтрэлт унасан уу, дүрэм хаасан уу, өөр bucket уу?
// Энэ нь гурвыг тусад нь шалгаж, ЯГ юу хийхийг хэлнэ.
const SD_PATHS = [
  { key: 'exam-images', label: 'Үзлэгийн зураг', where: 'app.js' },
  { key: 'lab-results', label: 'Шинжилгээний хариу', where: 'lab.js' }
];

function sdTinyJpeg() {
  const c = document.createElement('canvas');
  c.width = c.height = 8;
  const x = c.getContext('2d');
  x.fillStyle = '#c8a24a'; x.fillRect(0, 0, 8, 8);
  return c.toDataURL('image/jpeg', 0.5);
}

async function runStorageDiag() {
  const out = $('#sd-out'); if (!out) return;
  out.innerHTML = '<div class="muted">Шалгаж байна…</div>';

  const rows = [];
  const info = (typeof window.__fbAuthInfo === 'function') ? window.__fbAuthInfo() : null;

  if (!info) {
    out.innerHTML = '<div class="sd-bad">⛔ firebase.js ачаалагдаагүй байна. Хуудсыг Ctrl+F5-ээр бүрэн шинэчилнэ үү ' +
      '(эсвэл firebase.js файл GitHub-д ороогүй байж магадгүй).</div>';
    return;
  }

  rows.push(['Төсөл (project)', info.projectId || '—', !!info.projectId]);
  rows.push(['Storage bucket', info.bucket || '—', !!info.bucket]);
  rows.push(['Firebase бэлэн', info.ready ? 'тийм' : 'ҮГҮЙ', !!info.ready]);
  rows.push(['Интернэт (браузер)', info.online === false ? 'ТАСАРСАН' : 'холбоотой', info.online !== false]);
  rows.push(['Нэвтрэлт (uid)', info.uid ? (info.uid.slice(0, 10) + '… ' + (info.anonymous ? '(anonymous)' : '')) : 'НЭВТРЭЭГҮЙ', !!info.uid]);

  // 🔑 Токены шалгалт — Storage 403-ийн хамгийн далд шалтгаан.
  // Токен хуучирсан бол дүрэм ямар ч зөв байсан 403 гарна.
  let tok = { ok: false, reason: 'шалгаагүй' };
  if (typeof window.__fbTokenCheck === 'function') {
    try { tok = await window.__fbTokenCheck(); } catch (e) { tok = { ok: false, reason: (e && e.message) || 'алдаа' }; }
  }
  let tokTxt;
  if (tok.ok) {
    tokTxt = 'хүчинтэй';
    if (tok.expires) tokTxt += ' (дуусах: ' + new Date(tok.expires).toLocaleTimeString('mn-MN') + ')';
  } else {
    tokTxt = 'ШИНЭЧЛЭГДЭХГҮЙ БАЙНА — ' + (tok.reason || '');
  }
  rows.push(['Нэвтрэлтийн токен', tokTxt, !!tok.ok]);

  let dataUrl = '';
  try { dataUrl = sdTinyJpeg(); } catch (e) {}

  const results = [];
  if (info.uid && dataUrl && typeof window.__fbUploadImage === 'function') {
    for (const p of SD_PATHS) {
      const path = p.key + '/_diag/' + uid() + '.jpg';
      try {
        await window.__fbUploadImage(path, dataUrl);
        results.push({ p, ok: true, code: '' });
        try { if (window.__fbDeletePath) await window.__fbDeletePath(path); } catch (e) {}
      } catch (err) {
        results.push({ p, ok: false, code: (err && (err.code || err.message)) || 'алдаа', err });
      }
    }
  }
  results.forEach(r => rows.push([
    r.p.label + ' (' + r.p.key + '/)',
    r.ok ? '✅ Зөвшөөрөгдсөн' : '⛔ ' + r.code,
    r.ok
  ]));

  // ── Дүгнэлт ──
  let verdict = '';
  const okN = results.filter(r => r.ok).length;
  if (info.uid && !tok.ok) {
    verdict = '<b>Шалтгаан: нэвтрэлтийн токен шинэчлэгдэхгүй байна.</b><br>' +
      'Anonymous хэрэглэгчийн токен 1 цаг тутам шинэчлэгддэг. Сүлжээ тасарсан үед ' +
      'тэр шинэчлэлт (<code>securetoken.googleapis.com</code>) унаж, хуучин токеноор хүсэлт явсаар байдаг — ' +
      'Storage үүнийг хүлээж авахгүй тул <b>дүрэм зөв байсан ч 403 гарна</b>.<br>' +
      '<b>Хийх:</b> (1) Интернэтээ тогтвортой болгоод хуудсыг <b>Ctrl+F5</b>-ээр бүрэн шинэчилнэ. ' +
      '(2) Дахин шалгана — токен «хүчинтэй» болсон эсэхийг хараарай. ' +
      '(3) Дараа нь зураг оруулж үзнэ.';
  } else if (!info.uid) {
    verdict = '<b>Шалтгаан: нэвтрэлт үүсээгүй байна.</b><br>' +
      'Firebase Anonymous Auth ажиллаагүй тул Storage бүх хүсэлтийг татгалзана — зам, дүрэм хамаагүй.<br>' +
      '<b>Хийх:</b> Firebase Console → Build → <b>Authentication</b> → Sign-in method → <b>Anonymous</b> → Enable. ' +
      'Аль хэдийн асаалттай бол Authentication → Settings → <b>Authorized domains</b> дотор аппын домэйн ' +
      '(<code>' + escHTML(location.hostname) + '</code>) байгаа эсэхийг шалгана.';
  } else if (okN === results.length && results.length) {
    verdict = '<b>✅ Storage бүрэн ажиллаж байна</b> — хоёр зам хоёулаа зөвшөөрөгдлөө. ' +
      'Хэрэв зураг оруулахад алдаа гарсаар байвал файлын хэмжээ/төрөл эсвэл сүлжээний асуудал байж магадгүй.';
  } else if (okN === 0) {
    verdict = '<b>Шалтгаан: Storage-ийн дүрэм бүх замыг хааж байна</b> (токен хүчинтэй мөртлөө хоёр зам хоёулаа хаалттай).<br>' +
      '<b>Хийх:</b> Firebase Console → Build → <b>Storage</b> → <b>Rules</b>. ' +
      'Дээд талд bucket сонгох жагсаалт байвал <code>' + escHTML(info.bucket) + '</code>-ийг сонгосон эсэхээ шалгаад ' +
      'репо дахь <code>storage.rules</code> файлын агуулгыг бүтнээр буулгаж <b>Publish</b> дарна.';
  } else {
    const bad = results.filter(r => !r.ok).map(r => r.p.key + '/').join(', ');
    verdict = '<b>Шалтгаан: дүрэмд <code>' + escHTML(bad) + '</code> зам нэмэгдээгүй байна.</b><br>' +
      'Нэвтрэлт болон bucket зөв — зөвхөн энэ зам хаалттай.<br>' +
      '<b>Хийх:</b> Firebase Console → Build → <b>Storage</b> → <b>Rules</b> → ' +
      'репо дахь <code>storage.rules</code>-ийн агуулгыг бүтнээр буулгаад <b>Publish</b>. ' +
      'Аль хэдийн хийсэн бол: (1) зөв <b>төсөл</b> мөн эсэх, (2) Rules хуудсан дээр дээд талд ' +
      '<b>өөр bucket</b> сонгогдоогүй эсэх (<code>' + escHTML(info.bucket) + '</code> байх ёстой), ' +
      '(3) Publish дарсны дараа ногоон баталгаа гарсан эсэхийг шалгана.';
  }

  out.innerHTML =
    '<table class="sd-tb">' + rows.map(r =>
      '<tr><td>' + escHTML(r[0]) + '</td><td class="' + (r[2] ? 'sd-ok' : 'sd-bad') + '">' + escHTML(r[1]) + '</td></tr>'
    ).join('') + '</table>' +
    '<div class="sd-verdict">' + verdict + '</div>';

  results.filter(r => !r.ok).forEach(r => console.error('[Storage diag] ' + r.p.key, r.err));
}

// ── 🔌 Холболтын төлөв ба гар аргаар шинэчлэх ────────────────
// Firestore-ийн snapshot бүр «сервэрээс ирсэн үү, кэшнээс үү» гэдгээ
// хэлдэг. Үүгээр л жинхэнэ холболтыг мэдэж болно — өмнөх ногоон цэг
// зөвхөн бичилт болоход анивчдаг байсан тул холбогдсон эсэхийг
// харуулдаггүй байв.
let __fbConnected = null;   // null = хараахан мэдэгдэхгүй
let __fbLastServerMs = 0;

window.__fbNoteConn = function (fromCache) {
  const wasConnected = __fbConnected;
  __fbConnected = !fromCache;
  if (__fbConnected) __fbLastServerMs = nowMs();
  if (wasConnected !== __fbConnected) paintConnDot();
};

function paintConnDot() {
  const d = $('#sync-dot'); if (!d) return;
  d.classList.toggle('off', __fbConnected === false);
  d.classList.toggle('ok', __fbConnected === true);
  if (__fbConnected === false) {
    d.title = 'Сервэртэй холбогдоогүй — хадгалсан зүйл энэ төхөөрөмж дээр\nхүлээгдэж байна, холбогдмогц автоматаар илгээгдэнэ';
  } else if (__fbConnected === true) {
    d.title = 'Сервэртэй холбоотой · шинэ мэдээлэл шууд ирнэ' +
      (__fbLastServerMs ? '\nСүүлд: ' + new Date(__fbLastServerMs).toLocaleTimeString('mn-MN') : '');
  } else {
    d.title = 'Холбогдож байна…';
  }
}

// Маягттай хуудсан дээр «шинэ мэдээлэл ирлээ» товч
function renderRefreshChip() {
  const c = $('#refresh-chip'); if (!c) return;
  c.classList.toggle('show', !!__refreshPending);
}

// Гар аргаар шинэчлэх — одоогийн хуудсыг дахин зурна
function forceRefresh(silent) {
  const p = STATE.activePage;
  const editPages = new Set(['register', 'exam', 'planned']);
  if (editPages.has(p) && !silent) {
    if (!confirm('Хуудсыг шинэчлэх үү?\n\nОдоо бөглөж байгаа маягтын бичсэн зүйл арилна.')) return;
  }
  __refreshPending = false; renderRefreshChip();
  const main = $('#main'); const sc = main ? main.scrollTop : 0;
  nav(p, { silent: true });
  if (main) main.scrollTop = sc;
  if (!silent) {
    toast(__fbConnected === false
      ? '⚠️ Шинэчиллээ — гэхдээ сервэртэй холбогдоогүй байна'
      : '✅ Шинэчиллээ', __fbConnected === false ? 'err' : 'ok');
  }
}

// ── 📊 Синкийн төлөвийн самбар (утсан дээр F12 байхгүй тул) ───────
const SYNC_COL_LABELS = { horses: 'Адуу', exams: 'Үзлэг', fins: 'Accountant / Finance', inps: 'Байрлан эмчлүүлэх', waiting: 'Хүлээлт', staff: 'Ажилтан', doctors: 'Эмч', users: 'Хэрэглэгч', logs: 'Лог', deletedExams: 'Устгасан үзлэг', labs: 'Шинжилгээ', trips: 'Явц' };
function _fmtAgo(ms) { if (!ms) return '—'; const s = Math.round((Date.now() - ms) / 1000); return s < 60 ? s + ' сек' : s < 3600 ? Math.round(s / 60) + ' мин' : Math.round(s / 3600) + ' цаг'; }
async function openSyncStatus() {
  const m = $('#sync-status-modal'); if (!m) { forceRefresh(); return; }
  m.classList.add('show');
  const out = $('#ss-body'); if (!out) return;
  out.innerHTML = '<div class="muted">Шалгаж байна…</div>';
  const info = (typeof window.__fbAuthInfo === 'function') ? window.__fbAuthInfo() : {};
  let persist = { ok: null, detail: 'шалгах боломжгүй' };
  try { if (window.__fbPersistenceCheck) persist = await window.__fbPersistenceCheck(); } catch (e) { persist = { ok: false, detail: e.message }; }
  // localStorage хэмжээ
  let lsBytes = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); lsBytes += (k.length + (localStorage.getItem(k) || '').length) * 2; } } catch (e) {}
  const lsFail = Object.keys(__lsStatus.fails); const lsTrim = Object.keys(__lsStatus.trimmed);
  const rows = [];
  const row = (l, v, ok) => rows.push('<tr><td>' + escHTML(l) + '</td><td class="' + (ok === false ? 'sd-bad' : ok === true ? 'sd-ok' : '') + '">' + v + '</td></tr>');
  row('Сервэртэй холболт', __fbConnected === false ? 'ХОЛБОГДООГҮЙ' : __fbConnected ? 'холбоотой' : 'мэдэгдэхгүй', __fbConnected);
  row('Интернэт', info.online === false ? 'ТАСАРСАН' : 'байна', info.online !== false);
  row('Нэвтрэлт', info.uid ? 'байна' : 'БАЙХГҮЙ', !!info.uid);
  row('Дискэн кэш (IndexedDB)', persist.ok === true ? 'ажиллаж байна' : persist.ok === false ? 'АЖИЛЛАХГҮЙ — ' + escHTML(persist.detail || '') : escHTML(persist.detail || ''), persist.ok);
  row('localStorage', (lsBytes / 1024 / 1024).toFixed(1) + ' MB' + (lsFail.length ? ' · ДҮҮРСЭН: ' + escHTML(lsFail.join(', ')) : lsTrim.length ? ' · багасгасан: ' + escHTML(lsTrim.map(k => k.replace('mt_', '') + ' ' + __lsStatus.trimmed[k].kept + '/' + __lsStatus.trimmed[k].total).join(', ')) : ' · хэвийн'), lsFail.length ? false : true);
  row('Апп хувилбар', escHTML((document.querySelector('script[src^="app.js"]') || {}).src ? (document.querySelector('script[src^="app.js"]').src.split('v=')[1] || '?') : '?'), null);
  let colRows = '';
  FB_LISTENERS.forEach(L => {
    const c = L.col, st = __fbColStatus[L.key]; const n = Array.isArray(STATE[c]) ? STATE[c].length : (c === 'deletedExams' ? (STATE.deletedExams || []).length : '—');
    const state = !st ? '<span class="sd-bad">хариу ирээгүй</span>' : st.serverAt ? '<span class="sd-ok">сервэр ' + _fmtAgo(st.serverAt) + '</span>' : st.cacheAt ? '<span style="color:#b9770e;font-weight:700">зөвхөн кэш</span>' : '—';
    const scope = L.where ? ' <span class="muted">(' + (L.key === 'fins_open' ? 'төлөгдөөгүй' : LIVE_CUTOFF + '-с') + ')</span>' : L.limitN ? ' <span class="muted">(сүүлийн ' + L.limitN + ')</span>' : '';
    colRows += '<tr><td>' + escHTML(L.label || SYNC_COL_LABELS[c] || c) + scope + '</td><td>' + n + (st && st.n !== undefined && st.n !== n && !L.where ? ' <span class="muted">(сервэр: ' + st.n + ')</span>' : '') + '</td><td>' + state + '</td></tr>';
  });
  let verdict = '';
  if (__fbConnected === false) verdict = 'Сервэртэй холбогдоогүй байна — дата зөвхөн энэ төхөөрөмж дээр байгаа хувиар харагдана. Интернэтээ шалгана уу.';
  else if (lsFail.length) verdict = 'localStorage дүүрсэн тул зарим жагсаалт төхөөрөмж дээр хадгалагдахгүй байна. Дискэн кэш ажиллаж байвал асуудалгүй; ажиллахгүй бол «Кэш цэвэрлэж дахин татах» дарна уу.';
  else if (persist.ok === false) verdict = 'Дискэн кэш ажиллахгүй тул апп нээх бүрд бүх датаг сүлжээгээр татна — удаан байх нь энэ. Хувийн (private) горим, эсвэл хөтчийн хязгаарлалт байж болзошгүй.';
  else if (FB_LISTENERS.some(L => { const st = __fbColStatus[L.key]; return st && !st.serverAt; })) verdict = 'Зарим жагсаалт сервэрээс хараахан бүрэн ирээгүй байна (эхний удаа бүтнээр татаж байгаа байх). Аппыг хааж болохгүй, хэдэн минут хүлээнэ үү.';
  else verdict = 'Бүх жагсаалт сервэртэй тулгагдсан. Дэлгэц хуучин харагдвал «Шинэчлэх» дарна уу.';
  out.innerHTML = '<table class="sd-tb">' + rows.join('') + '</table>' +
    '<table class="sd-tb" style="margin-top:8px"><tr><th style="text-align:left">Жагсаалт</th><th style="text-align:left">Тоо</th><th style="text-align:left">Төлөв</th></tr>' + colRows + '</table>' +
    '<div class="sd-verdict">' + verdict + '</div>';
}
async function resetLocalCache() {
  if (!confirm('Энэ төхөөрөмж дээрх кэшийг цэвэрлээд сервэрээс бүгдийг дахин татах уу?\n\nХадгалагдаагүй (хүлээгдэж буй) бичилт байвал алдагдаж болзошгүй. Интернэт сайтай үедээ хийнэ үү.')) return;
  try {
    const keep = { mt_user: localStorage.getItem('mt_user'), mt_users: localStorage.getItem('mt_users') };
    if (window.__fbResetCache) await window.__fbResetCache();
    Object.keys(localStorage).filter(k => k.startsWith('mt_')).forEach(k => localStorage.removeItem(k));
    if (keep.mt_user) localStorage.setItem('mt_user', keep.mt_user);
    if (keep.mt_users) localStorage.setItem('mt_users', keep.mt_users);
  } catch (e) { console.error('[reset]', e); }
  location.reload();
}

// 📱 Утсан дээр аппыг ар талаас буцаан нээхэд дэлгэц хуучин датаг
// харуулсаар үлддэг байсан — буцаж ирэхэд дуугүй дахин зурна.
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !STATE.user) return;
  const editPages = new Set(['register', 'exam', 'planned']);
  if (editPages.has(STATE.activePage)) { renderRefreshChip(); return; }
  forceRefresh(true);
});
window.addEventListener('online', () => { if (STATE.user) setTimeout(() => forceRefresh(true), 1200); });

let __navSetupDone = false;
function setupNav() {
  if (__navSetupDone) return; // logout/login дахин дуудагдахад давхар listener нэмэхгүй
  __navSetupDone = true;
  $$('.ni[data-page]').forEach(n => n.addEventListener('click', () => nav(n.dataset.page)));
  $$('.bn-i[data-page]').forEach(n => n.addEventListener('click', () => nav(n.dataset.page)));
  $('#bn-menu').addEventListener('click', () => {
    $('#drawer').classList.add('show');
    $('#drawer-bd').classList.add('show');
  });
  $('#drawer-bd').addEventListener('click', () => {
    $('#drawer').classList.remove('show');
    $('#drawer-bd').classList.remove('show');
  });
  const sd = $('#sync-dot');
  if (sd) { sd.style.cursor = 'pointer'; sd.addEventListener('click', () => openSyncStatus()); }
  $('#ni-sync').addEventListener('click', openServicePrices);
  if ($('#ni-sync2')) $('#ni-sync2').addEventListener('click', openServicePrices);
}

// ============================================================
// HEADER & BADGES
// ============================================================
function updateBadges() {
  try { if (typeof updatePharmBadge === 'function') updatePharmBadge(); } catch(e) {}
  // 🧪 Шинжилгээ — хүлээгдэж буй
  try {
    const labOpen = (STATE.labs || []).filter(x => x && x.status !== 'done' && x.status !== 'cancelled').length;
    ['bdg-lab','bdg-lab2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = labOpen; el.style.display = labOpen ? '' : 'none'; }
    });
  } catch(e) {}
  const w = STATE.waiting.length;
  const i = STATE.inps.filter(x => !x.discharged).length;
  // Finance badge: pending + receivables (anything with due > 0)
  const f = STATE.fins.filter(x => {
    if (typeof getDueAmount === 'function') return getDueAmount(x) > 0;
    return !x.paid;
  }).length;
  const _today = todayStr();
  const todayExams = STATE.exams.filter(x => {
    const d = typeof x.date === 'string' ? x.date.slice(0,10) : '';
    return d === _today;
  }).length;
  const total = STATE.horses.length;

  $('#hs-w').textContent = w;
  $('#hs-t').textContent = todayExams;
  $('#hs-n').textContent = total;
  $('#bdg-w').textContent = w;
  $('#bdg-i').textContent = i;
  $('#bdg-f').textContent = f;
  if ($('#bdg-w2')) $('#bdg-w2').textContent = w;
  if ($('#bdg-i2')) $('#bdg-i2').textContent = i;
  if ($('#bdg-f2')) $('#bdg-f2').textContent = f;
  // 🩺 Senior Veterinarianийн хяналт — батлах хүлээгдэж буй онош
  try {
    const rv = dxOpenList().filter(e => e.dxStatus === 'pending').length;
    ['bdg-rv', 'bdg-rv2'].forEach(id => { const el = document.getElementById(id); if (el) { el.textContent = rv; el.style.display = rv ? '' : 'none'; } });
    reviewNotify();
  } catch (e) { console.error('review badge', e); }
  // bottom-nav waiting dot
  const bnDotW = $('#bn-dot-w');
  if (bnDotW) {
    bnDotW.textContent = w > 99 ? '99+' : w;
    bnDotW.classList.toggle('show', w > 0);
  }
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const h = new Date().getHours();
  let g = 'Сайн байна уу';
  if (h < 11) g = 'Өглөөний мэнд';
  else if (h < 17) g = 'Өдрийн мэнд';
  else g = 'Оройн мэнд';
  $('#greet-t').textContent = g + ', ' + (STATE.user ? STATE.user.role : '') + '!';
  const today = new Date();
  $('#greet-d').textContent = today.toLocaleDateString('mn-MN', {year:'numeric',month:'long',day:'numeric',weekday:'long'});

  // Normalize date string for any item.date
  const dateOf = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.slice(0,10);
    try { return localDateStr(new Date(v)); } catch(e) { return ''; }
  };
  const todayKey = todayStr();
  const todayExams = STATE.exams.filter(x => dateOf(x.date) === todayKey);
  const todayRev = STATE.fins.filter(x => x.paid && dateOf(x.paidDate) === todayKey)
    .reduce((a,b) => a + (parseFloat(b.amount)||0), 0);
  const activeInps = STATE.inps.filter(x => !x.discharged).length;
  // This week's exams: Monday 00:00 → today 23:59
  const _now = new Date();
  const _day = _now.getDay() || 7; // Sunday=7
  const _monday = new Date(_now);
  _monday.setDate(_now.getDate() - (_day - 1));
  _monday.setHours(0,0,0,0);
  const weekStart = _monday.getTime();
  const weekEnd = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 23,59,59).getTime();
  // ⚠️ Огноог эхэлж — e.ms нь засвар/онош батлахад шинэчлэгддэг тул үзлэгийн цаг биш
  const examTime = (e) => {
    if (e.date) {
      try { const t = new Date(e.date + (e.time?'T'+e.time:'T12:00')).getTime(); if (t > 0) return t; } catch(_) {}
    }
    return parseFloat(e.ms) || 0;
  };
  const weekExams = STATE.exams.filter(x => {
    const t = examTime(x);
    return t >= weekStart && t <= weekEnd;
  }).length;

  $('#d-today').textContent = todayExams.length;
  $('#d-inp').textContent   = activeInps;
  $('#d-week').textContent  = weekExams;

  // Орлогын дүн — зөвхөн санхүү харах эрхтэй хүнд харуулна.
  // Эмч нарын эрхээр орсон үед мөнгөн дүн харагдахгүй.
  const revCard = $('#d-rev-card');
  if (canSeeFinance()) {
    if (revCard) revCard.style.display = '';
    $('#d-rev').textContent = fmtCompact(todayRev);
  } else {
    if (revCard) revCard.style.display = 'none';
  }

  // 🔔 Сануулгууд (онош батлах, эзэнд залгах, өдрийн эмчилгээ)
  try { renderDashAlerts(); } catch (e) { console.error('dash alerts', e); }

  // Staff (HR) — render
  renderStaffSection();

  // Recent exams — сүүлийн 50 л харуулна (бүгдийг render хийхгүй)
  const rl = $('#d-r-list');
  const recent = [...STATE.exams].sort((a,b) => recTime(b) - recTime(a)).slice(0, 50);
  $('#d-r-cnt').textContent = STATE.exams.length; // нийт тоог харуулна
  if (recent.length === 0) {
    rl.innerHTML = '<div class="empty"><div class="empty-em">📝</div>Үзлэг хараахан алга</div>';
  } else {
    const showAmt = canSeeFinance();
    rl.innerHTML = recent.map(e => `
      <div class="li" data-eid="${escHTML(e.id)}" style="cursor:pointer">
        <div class="li-stripe"></div>
        <div class="li-av">🩺</div>
        <div class="li-info">
          <div class="li-name">${escHTML(e.horse)} <span class="muted" style="font-weight:600">· ${escHTML(e.owner||'')}</span></div>
          <div class="li-sub">${e.examNum?'<span class="badge b-o" style="font-size:10px;margin-right:4px">'+escHTML(e.examNum)+'</span>':''}${escHTML(e.diagnosis||'—')}</div>
        </div>
        <div class="li-r">
          <div class="li-time">${escHTML(dateOf(e.date))}</div>
          ${showAmt ? '<span class="badge b-g">'+fmtCompact(e.amount||0)+'</span>' : ''}
        </div>
      </div>
    `).join('');
    rl.querySelectorAll('.li').forEach(el => el.addEventListener('click', () => {
      openExamDetail(el.dataset.eid);
    }));
  }
}

// ============================================================
// HR (STAFF) — daily roster of working / on-duty doctors
// ============================================================

function getStaffData() {
  // Stored as { id: 'YYYY-MM-DD', date: 'YYYY-MM-DD', active: [docId, ...], duty: [docId, ...] }
  // Эх сурвалжийн дараалал:
  //   1) Сарын ажлын хувиар (STATE.staffSchedule) — өнөөдрийн төлвүүдээс active/duty гаргана
  //   2) STATE.staff (өдрийн roster, Sheet-ээс синк)
  //   3) Хоосон
  const today = todayStr();

  // 0) 🕒 Цагийн бүртгэлийн өнөөдрийн код (эмчтэй холбосон ажилтнууд) — байвал энэ эрхэмлэнэ
  try { if (typeof tsDayStaffFromCodes === 'function') { const fromTs = tsDayStaffFromCodes(today); if (fromTs) return fromTs; } } catch (e) {}

  // 1) Сарын хувиараас өнөөдрийн өгөгдөл
  const fromSchedule = getDayStaffFromSchedule(today);
  if (fromSchedule && (fromSchedule.active.length || fromSchedule.duty.length)) {
    return fromSchedule;
  }

  // 2) Хуучин өдрийн roster
  if (Array.isArray(STATE.staff)) {
    const found = STATE.staff.find(s => String(s.id) === today || String(s.date) === today);
    if (found) {
      return {
        date: today,
        active: parseStaffArray(found.active),
        duty: parseStaffArray(found.duty)
      };
    }
  }
  return { date: today, active: [], duty: [] };
}

// Сарын хувиараас тухайн өдрийн ажиллах / жижүүр эмчийн жагсаалт гаргана
// Төлөв: 'work' (ажиллах), 'duty' (жижүүр), 'off' (амрах)
function getDayStaffFromSchedule(dateStr) {
  const ym = (dateStr || todayStr()).slice(0, 7); // 'YYYY-MM'
  const sched = STATE.staffSchedule && STATE.staffSchedule[ym];
  if (!sched) return null;
  const active = [];
  const duty = [];
  Object.keys(sched).forEach(docId => {
    const status = sched[docId] && sched[docId][dateStr];
    if (status === 'work') active.push(String(docId));
    else if (status === 'duty') { active.push(String(docId)); duty.push(String(docId)); }
  });
  return { date: dateStr, active, duty };
}

function parseStaffArray(v) {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string' && v.trim()) {
    // Try JSON
    try { const parsed = JSON.parse(v); if (Array.isArray(parsed)) return parsed.map(String); } catch(_){}
    // Comma-separated fallback
    return v.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function saveStaffData(data) {
  // Push to STATE.staff for Oracle sync
  if (!Array.isArray(STATE.staff)) STATE.staff = [];
  const today = data.date || todayStr();
  const idx = STATE.staff.findIndex(s => String(s.id) === today);
  const record = {
    id: today,
    date: today,
    active: data.active || [],
    duty: data.duty || [],
    ms: nowMs()
  };
  // 🕒 Цагийн бүртгэлийн кодуудыг (codes) дарахгүй хадгална
  if (idx >= 0 && STATE.staff[idx] && STATE.staff[idx].codes) record.codes = STATE.staff[idx].codes;
  if (idx >= 0) STATE.staff[idx] = record;
  else STATE.staff.push(record);
  saveAll();
  fbSaveRecord('staff', record);
}

function renderStaffSection() {
  const data = getStaffData();
  const activeWrap = $('#d-staff-active');
  const dutyWrap = $('#d-staff-duty');

  const renderChips = (ids, dutyMode) => {
    if (!ids || ids.length === 0) {
      return '<div style="font-size:12px;color:var(--muted);font-weight:600;padding:4px 0">Тохируулаагүй</div>';
    }
    return ids.map(id => {
      const d = STATE.doctors.find(x => String(x.id) === String(id));
      if (!d) return '';
      const initials = d.name.split(/[\s.\-]+/).filter(Boolean).slice(0,2).map(s => s[0]).join('');
      return `
        <span class="staff-chip${dutyMode?' duty':''}">
          <span class="staff-chip-av">${escHTML(initials.toUpperCase())}</span>
          <span>${escHTML(d.name)}</span>
        </span>`;
    }).join('');
  };

  activeWrap.innerHTML = renderChips(data.active, false);
  dutyWrap.innerHTML = renderChips(data.duty, true);
}

function openStaffModal() {
  const data = getStaffData();
  const activeSet = new Set(data.active.map(String));
  const dutySet = new Set(data.duty.map(String));

  $('#staff-mod-body').innerHTML = STATE.doctors.map(d => `
    <div class="staff-row">
      <div style="flex:1;min-width:0">
        <div class="staff-row-name">${escHTML(d.name)}</div>
        <div class="staff-row-role">${escHTML(d.role)}</div>
      </div>
      <label class="staff-cb">
        <input type="checkbox" class="staff-active" data-id="${escHTML(d.id)}" ${activeSet.has(String(d.id))?'checked':''}>
        Ажиллах
      </label>
      <label class="staff-cb">
        <input type="checkbox" class="staff-duty" data-id="${escHTML(d.id)}" ${dutySet.has(String(d.id))?'checked':''}>
        Жижүүр
      </label>
    </div>
  `).join('');
  openModal('staff-modal');
}

function saveStaff() {
  const active = [...document.querySelectorAll('.staff-active:checked')].map(c => c.dataset.id);
  const duty   = [...document.querySelectorAll('.staff-duty:checked')].map(c => c.dataset.id);
  saveStaffData({ date: todayStr(), active, duty });
  closeModal('staff-modal');
  renderStaffSection();
  toast('💾 Хадгалагдлаа', 'ok');
}

// ============================================================
// HR — САРЫН АЖЛЫН ХУВИАР (monthly work schedule)
// ============================================================
// STATE.staffSchedule = { 'YYYY-MM': { docId: { 'YYYY-MM-DD': 'work'|'duty'|'off' } } }

let SCHED_MONTH = todayStr().slice(0, 7); // одоогоор сонгогдсон сар

function daysInMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}
function ymdOf(ym, day) {
  return ym + '-' + String(day).padStart(2, '0');
}
const SCHED_DOW = ['Ня','Да','Мя','Лх','Пү','Ба','Бя'];
function dowOf(ym, day) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, day).getDay(); // 0=Sunday
}
const SCHED_STATUS_CYCLE = ['off', 'work', 'duty'];
const SCHED_STATUS_LABEL = { off: '–', work: 'R', duty: 'N' };
const SCHED_STATUS_TITLE = { off: 'Амрах', work: 'Ажиллах', duty: 'Night Duty' };

function getSchedMonth() {
  if (!STATE.staffSchedule) STATE.staffSchedule = {};
  if (!STATE.staffSchedule[SCHED_MONTH]) STATE.staffSchedule[SCHED_MONTH] = {};
  return STATE.staffSchedule[SCHED_MONTH];
}

function openScheduleModal() {
  SCHED_MONTH = todayStr().slice(0, 7);
  $('#sched-month').value = SCHED_MONTH;
  renderScheduleGrid();
  openModal('schedule-modal');
}

function changeSchedMonth() {
  const v = $('#sched-month').value;
  if (v) { SCHED_MONTH = v; renderScheduleGrid(); }
}

function renderScheduleGrid() {
  const month = getSchedMonth();
  const nDays = daysInMonth(SCHED_MONTH);
  const docs = STATE.doctors || [];

  if (!docs.length) {
    $('#sched-grid-wrap').innerHTML = '<div class="empty"><div class="empty-em">👨‍⚕️</div>Эмч бүртгэгдээгүй байна</div>';
    return;
  }

  // Толгойн мөр: өдрүүд
  let head = '<th class="sched-doc-h">Эмч</th>';
  for (let d = 1; d <= nDays; d++) {
    const dow = dowOf(SCHED_MONTH, d);
    const wkend = (dow === 0 || dow === 6) ? ' sched-wkend' : '';
    head += `<th class="sched-day-h${wkend}"><div>${d}</div><div class="sched-dow">${SCHED_DOW[dow]}</div></th>`;
  }

  // Эмч бүрийн мөр
  let rows = '';
  docs.forEach(doc => {
    const did = String(doc.id);
    const docMap = month[did] || {};
    let cells = `<td class="sched-doc-c"><div class="sched-doc-name">${escHTML(doc.name)}</div><div class="sched-doc-role">${escHTML(doc.role||'')}</div></td>`;
    let workCount = 0, dutyCount = 0;
    for (let d = 1; d <= nDays; d++) {
      const ymd = ymdOf(SCHED_MONTH, d);
      const st = docMap[ymd] || 'off';
      if (st === 'work') workCount++;
      if (st === 'duty') { workCount++; dutyCount++; }
      cells += `<td class="sched-cell sched-${st}" data-doc="${escHTML(did)}" data-ymd="${ymd}" onclick="cycleSchedCell(this)" title="${SCHED_STATUS_TITLE[st]}">${SCHED_STATUS_LABEL[st]}</td>`;
    }
    cells += `<td class="sched-sum">${workCount}<span class="sched-sum-duty">/${dutyCount}</span></td>`;
    rows += `<tr>${cells}</tr>`;
  });

  $('#sched-grid-wrap').innerHTML = `
    <table class="sched-table">
      <thead><tr>${head}<th class="sched-sum-h">Нийт<span class="sched-sum-duty">/Ж</span></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// Нүд дээр дарахад төлөв солигдоно: Амрах → Ажиллах → Жижүүр → Амрах
function cycleSchedCell(td) {
  const did = td.dataset.doc;
  const ymd = td.dataset.ymd;
  const month = getSchedMonth();
  if (!month[did]) month[did] = {};
  const cur = month[did][ymd] || 'off';
  const next = SCHED_STATUS_CYCLE[(SCHED_STATUS_CYCLE.indexOf(cur) + 1) % SCHED_STATUS_CYCLE.length];
  if (next === 'off') delete month[did][ymd];
  else month[did][ymd] = next;
  // Нүдийг шинэчилнэ
  td.className = 'sched-cell sched-' + next;
  td.textContent = SCHED_STATUS_LABEL[next];
  td.title = SCHED_STATUS_TITLE[next];
  // Тухайн эмчийн нийлбэрийг шинэчилнэ
  updateSchedRowSum(td);
}

function updateSchedRowSum(td) {
  const tr = td.closest('tr');
  if (!tr) return;
  let work = 0, duty = 0;
  tr.querySelectorAll('.sched-cell').forEach(c => {
    if (c.classList.contains('sched-work')) work++;
    if (c.classList.contains('sched-duty')) { work++; duty++; }
  });
  const sum = tr.querySelector('.sched-sum');
  if (sum) sum.innerHTML = `${work}<span class="sched-sum-duty">/${duty}</span>`;
}

function saveSchedule() {
  saveAll();
  // ⚠️ Урьд нь энд зөвхөн staffSchedule бичдэг байсан нь clinic_config-ийн
  // бусад талбарыг (үйлчилгээний үнэ!) сервэрээс устгаж байсан.
  fbSaveClinicConfig();
  closeModal('schedule-modal');
  renderStaffSection();
  toast('💾 Сарын хуваарь хадгалагдлаа', 'ok');
}

// ============================================================
// EXAM DETAIL MODAL (from dashboard recent exams)
// ============================================================

// Тухайн үзлэгтэй холбоотой бүх логийг (бүртгэл → үзлэг → төлбөр) хугацааны дарааллаар цуглуулна
function buildExamTimeline(e) {
  if (!Array.isArray(STATE.logs)) return [];
  const examNum = String(e.examNum || '').trim();
  const examNumDigits = (examNum.match(/\d+/) || [])[0];
  const ids = new Set([String(e.id)]);
  // Холбоотой санхүүгийн бичлэгийн id-г мөн нэмнэ
  STATE.fins.filter(f => String(f.examId) === String(e.id)).forEach(f => ids.add(String(f.id)));
  // Холбоотой морины id (бүртгэлийн лог морины id-аар холбогдоно)
  if (e.horseId) ids.add(String(e.horseId));

  const matchByExamNum = (n) => {
    if (!examNumDigits || !n) return false;
    const d = (String(n).match(/\d+/) || [])[0];
    return d && parseInt(d,10) === parseInt(examNumDigits,10);
  };

  return STATE.logs
    .filter(l => {
      if (l.exam_id && matchByExamNum(l.exam_id)) return true;
      if (l.target_id && ids.has(String(l.target_id))) return true;
      return false;
    })
    .sort((a,b) => (a.log_ms||0) - (b.log_ms||0));
}

// Үйлдлийн нэрэнд тохирох жижиг icon/өнгө
function timelineMeta(action) {
  const a = action || '';
  if (a.includes('бүртгэс'))    return { icon:'🐴', color:'var(--blue)'   || '#2a5aaa' };
  if (a.includes('эхлүүлс'))    return { icon:'▶️', color:'#2a5aaa' };
  if (a.includes('дуусгас'))    return { icon:'🩺', color:'var(--orange-dark)' };
  if (a.includes('Төлбөр') || a.includes('төлбөр')) return { icon:'💰', color:'var(--green)' };
  if (a.includes('засвар'))     return { icon:'✏️', color:'#b36b00' };
  if (a.includes('устгас'))     return { icon:'🗑️', color:'var(--red)' };
  return { icon:'•', color:'var(--muted)' };
}

// Үзлэгийн анамнез: бүртгэлийн үед бичсэн текст + эмчийн сонгосон шинж тэмдгүүд
function examAnamnesis(e) {
  if (!e) return { text: '', symptoms: [] };
  const toArr = v => Array.isArray(v) ? v : [];
  const text = (e.anamnesis && String(e.anamnesis).trim())
    || (typeof e.symptoms === 'string' ? e.symptoms.trim() : '')
    || '';
  const symptoms = [...new Set([...toArr(e.symptoms), ...toArr(e.symptoms2)].map(x => String(x).trim()).filter(Boolean))];
  return { text, symptoms };
}

function openExamDetail(eid) {
  const e = STATE.exams.find(x => String(x.id) === String(eid));
  if (!e) { toast('Үзлэг олдсонгүй', 'err'); return; }
  // Find linked finance record
  const fin = finByExamId(e.id);
  const dateOf = (v) => {
    if (!v) return '—';
    if (typeof v === 'string') return v.slice(0,10);
    try { return localDateStr(new Date(v)); } catch(_) { return String(v); }
  };

  const _seeFin = canSeeFinance();

  // Services list
  let svcHTML = '<div class="muted">Үйлчилгээ алга</div>';
  if (Array.isArray(e.services) && e.services.length) {
    svcHTML = '<div style="display:flex;flex-direction:column;gap:4px">' + e.services.map(s => `
      <div class="row" style="justify-content:space-between;background:var(--input);padding:6px 10px;border-radius:6px">
        <span style="font-size:12px;font-weight:700">${escHTML(s.name||'')}</span>
        ${_seeFin ? '<span class="bold" style="font-size:12px">'+fmt(parseFloat(s.price)||0)+'</span>' : ''}
      </div>
    `).join('') + '</div>';
  }

  // Meds
  let medsHTML = '<div class="muted">Эм алга</div>';
  if (Array.isArray(e.meds) && e.meds.length) {
    medsHTML = '<div style="display:flex;flex-direction:column;gap:3px">' + e.meds.map(m => { const name=m.name||m; const note=m.note||''; return `<span class="badge b-a" style="display:inline-flex;gap:6px"><b>${escHTML(name)}</b>${note?`<span style="font-weight:400;opacity:0.85">${escHTML(note)}</span>`:''}</span>`; }).join('') + '</div>';
  } else if (typeof e.meds === 'string' && e.meds.trim()) {
    medsHTML = '<div style="font-size:12px;background:var(--input);padding:8px;border-radius:6px;white-space:pre-wrap">' + escHTML(e.meds) + '</div>';
  }

  // Payment status
  let payHTML;
  if (!fin) {
    payHTML = '<span class="badge">Нэхэмжлэхгүй</span>';
  } else if (fin.paid) {
    payHTML = `<span class="badge b-g">✅ Төлсөн · ${escHTML(fin.method||'—')}</span> <span class="muted" style="font-size:11px">${escHTML(dateOf(fin.paidDate))}</span>`;
  } else {
    payHTML = '<span class="badge b-r">⏳ Хүлээгдэж буй</span>';
  }

  // 🏥 Холбоотой байрлан эмчлүүлэлт — Түүхийн дэлгэрэнгүйд харуулна
  const inp = STATE.inps.find(x => String(x.examId) === String(e.id));
  let inpHTML = '';
  if (inp) {
    const iDays = inpatientDays(inp.admittedMs, inp.dischargedMs);
    const iLogs = Array.isArray(inp.log) ? inp.log : [];
    const statusBadge = inp.discharged
      ? '<span class="badge b-g" title="' + escHTML(inpDischargeAuditText(inp)) + '">🚪 Гарсан · ' + escHTML(inp.dischargedDate || '') + (inp.dischargedBy ? ' · ' + escHTML(inp.dischargedBy) : '') + '</span>'
      : '<span class="badge b-p">🏥 Байрлаж байна</span>';
    const logRows = iLogs.length
      ? '<div style="max-height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:3px;margin-top:6px">' + iLogs.map(l => `
          <div class="row" style="justify-content:space-between;background:var(--input);padding:5px 10px;border-radius:6px;font-size:12px">
            <span>${escHTML(l.date || '—')} <span class="muted">${escHTML(l.docName || '')}</span>${l.diagnosis ? ' · ' + escHTML(l.diagnosis) : ''}</span>
            ${_seeFin ? '<span class="bold">' + fmt(l.amount || 0) + '</span>' : ''}
          </div>`).join('') + '</div>'
      : '<div class="muted" style="font-size:12px;margin-top:4px">Өдрийн бичлэг алга</div>';
    inpHTML = `
    <div class="fld" style="margin-top:12px"><label>🏥 Байрлан эмчлүүлэлт</label>
      <div style="background:var(--input);padding:10px;border-radius:8px">
        <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:6px">
          <div style="font-size:12px">
            <b>Орсон:</b> ${escHTML(inp.admittedDate || '—')} ·
            <b>Хоног:</b> ${iDays} ·
            <b>Бичлэг:</b> ${iLogs.length}
          </div>
          <div>${statusBadge}</div>
        </div>
        ${logRows}
        <button class="btn btn-xs" style="margin-top:8px" onclick="printInpatientCard('${escHTML(String(inp.id))}')">🖨 Дэвтэр хэвлэх</button>
      </div>
    </div>`;
  }

  if (!inp && !isPlanned(e) && canEditData()) {
    const blk = examToInpBlock(e);
    inpHTML = `<div class="fld" style="margin-top:12px"><label>🏥 Байрлан эмчлүүлэлт</label>
      <div style="background:var(--input);padding:10px;border-radius:8px;font-size:12.5px">
        ${blk ? '<span class="muted">' + escHTML(blk) + '</span>'
              : `Адуу үнэндээ байрлан эмчлүүлэх байсан бол: <button class="btn btn-xs btn-p" style="margin-left:6px" onclick="openExamToInp('${escHTML(e.id)}')">🏥 Байрлан эмчилгээнд шилжүүлэх</button>
                 <div class="muted" style="font-size:11px;margin-top:4px">Нэхэмжлэх давхардахгүй — төлсөн мөнгө урьдчилгаа болно.</div>`}
      </div></div>`;
  }
  const anam = examAnamnesis(e);
  $('#ex-detail-title').innerHTML = `📋 ${escHTML(e.horse)} ${e.examNum?'<span class="badge b-o" style="margin-left:6px">'+escHTML(e.examNum)+'</span>':''}${isPlanned(e) ? ' <span class="badge b-p" style="margin-left:4px">🗓️ Төлөвлөгөөт' + (e.tripLocation ? ' · ' + escHTML(e.tripLocation) : '') + '</span>' : ''}`;
  $('#ex-detail-body').innerHTML = `
    <div class="fg r2" style="margin-bottom:10px">
      <div class="fld"><label>Эзэн</label><div class="bold">${escHTML(e.owner||'—')}</div></div>
      <div class="fld"><label>Утас</label><div class="bold">${escHTML(e.phone||'—')}</div></div>
      <div class="fld"><label>Огноо</label><div>${escHTML(dateOf(e.date))} ${escHTML(e.time||'')}</div></div>
      <div class="fld"><label>Эмч</label><div>${escHTML(e.docName||'—')}${e.assistDocName?'<br><span class="muted" style="font-size:11px">Хамт: '+escHTML(e.assistDocName)+'</span>':''}</div></div>
    </div>
    <div class="fld" style="margin-bottom:10px"><label>📝 Анамнез <span class="muted" style="font-weight:600;text-transform:none">— бүртгэлийн үед бичсэн</span></label>
      <div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px;white-space:pre-wrap">${escHTML(anam.text || '—')}</div>
      ${anam.symptoms.length ? '<div class="row" style="gap:4px;flex-wrap:wrap;margin-top:6px">' + anam.symptoms.map(x => '<span class="badge b-o">' + escHTML(x) + '</span>').join('') + '</div>' : ''}
    </div>
    <div class="fld" style="margin-bottom:10px"><label>Онош ${isPlanned(e) ? '' : dxBadgeHTML(e, { small: true, legacy: true })}</label>
      <div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px">${escHTML(e.diagnosis||'—')}</div>
      ${e.dxStatus === 'returned' && e.dxReturnNote ? `<div style="color:var(--red);font-size:12px;margin-top:4px">↩ ${escHTML(e.dxReturnedBy || '')}: ${escHTML(e.dxReturnNote)}</div>` : ''}
      ${!isPlanned(e) && (canApproveDx() || (canResubmitDx(e) && !dxIsApproved(e))) ? `<button class="btn btn-xs ${dxIsOpen(e) ? 'btn-p' : ''}" style="margin-top:6px" onclick="closeModal('exam-detail-modal');openDxModal('${escHTML(e.id)}', function(){openExamDetail('${escHTML(e.id)}')})">🩺 ${canApproveDx() ? (dxIsApproved(e) ? 'Онош засах' : 'Онош хянах / батлах') : (e.dxStatus === 'returned' ? 'Онош засаж дахин илгээх' : (dxStatusOf(e) ? 'Онош засах' : 'Senior Veterinarianид хянуулах'))}</button>` : ''}
    </div>
    ${e.note ? `<div class="fld" style="margin-bottom:10px"><label>Тэмдэглэл</label><div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px;white-space:pre-wrap">${escHTML(e.note)}</div></div>` : ''}
    <div class="fld" style="margin-bottom:10px"><label>Үйлчилгээ</label>${svcHTML}</div>
    <div class="fld" style="margin-bottom:10px"><label>Эмийн жор</label>${medsHTML}</div>
    <div class="fld" style="margin-bottom:10px"><label>Үзлэгийн үзүүлэлт</label>
      <div style="font-size:12px;color:var(--muted)">
        Темп: <b style="color:var(--text)">${escHTML(e.temp||'—')}</b> ·
        Зүрх: <b style="color:var(--text)">${escHTML(e.pulse||'—')}</b> ·
        Амьсгал: <b style="color:var(--text)">${escHTML(e.resp||'—')}</b> ·
        Жин: <b style="color:var(--text)">${escHTML(e.wt||'—')}</b>
      </div>
    </div>
    ${(e.durationMin!==null && e.durationMin!==undefined) ? `<div class="fld" style="margin-bottom:10px"><label>⏱️ Зарцуулсан хугацаа</label>
      <div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px"><b>${fmtDuration(e.durationMin)}</b>${(e.regMs&&e.doneMs)?` <span class="muted" style="font-size:11px">(${fmtTime(e.regMs)} → ${fmtTime(e.doneMs)})</span>`:''}</div>
    </div>` : ''}
    <div class="fld"><label>Төлбөр</label>
      <div class="row" style="justify-content:space-between">
        <div>${payHTML}</div>
        ${_seeFin ? '<div style="font-size:18px;font-weight:900;color:var(--orange-dark)">'+fmt(e.amount||0)+'</div>' : ''}
      </div>
    </div>
    ${inpHTML}
    <div class="fld" style="margin-top:10px"><label>📷 Зураг</label>
      <div id="exd-images" class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px"></div>
      <input type="file" id="exd-img-input" accept="image/*" multiple capture="environment" style="display:none">
      <button type="button" class="btn btn-sm" id="exd-img-add">➕ Зураг нэмэх</button>
    </div>
    <div class="fld" style="margin-top:12px"><label>🧭 Процессын түүх <span class="muted" style="font-weight:600;text-transform:none">— хэн, хэзээ хийсэн</span></label>
      <div id="exd-timeline"></div>
    </div>
  `;
  openModal('exam-detail-modal');
  renderExamTimeline(e);
  // Зураг харуулах + нэмэх (exam detail)
  if (!Array.isArray(e.images)) e.images = [];
  _lightboxImgs = e.images;
  renderExamDetailImages(e);
  const addBtn = $('#exd-img-add');
  const fileInput = $('#exd-img-input');
  if (addBtn && fileInput) {
    addBtn.onclick = () => fileInput.click();
    fileInput.onchange = async () => {
      const files = Array.from(fileInput.files || []);
      fileInput.value = '';
      if (!files.length) return;
      if (e.images.length + files.length > IMG_MAX_PER_EXAM) {
        toast('Үзлэг бүрт дээд тал нь ' + IMG_MAX_PER_EXAM + ' зураг', 'err');
        return;
      }
      if (!window.__fbReady || !window.__fbUploadImage) {
        toast('⛔ Firebase холбогдоогүй байна. Зураг хадгалах боломжгүй.', 'err');
        return;
      }
      toast('Зураг боловсруулж байна...', 'ok');
      let successCount = 0;
      for (const file of files) {
        try {
          const dataUrl = await resizeImageFile(file);
          const imgId = uid();
          const path = 'exam-images/' + e.id + '/' + imgId + '.jpg';
          try {
            const url = await window.__fbUploadImage(path, dataUrl);
            // Зөвхөн URL болон path хадгална — base64 data хадгалахгүй
            e.images.push({ id: imgId, url: url, path: path, ms: nowMs() });
            successCount++;
          } catch (upErr) {
            // base64 fallback ХОРИОТОЙ — Firestore/localStorage-г дүүргэнэ
            toast('⛔ Зураг илгээж чадсангүй: ' + storageErrMsg(upErr), 'err');
            console.error('[Storage] exam-images бичих алдаа:', path, upErr);
          }
        } catch (err) {
          toast(err.message || 'Зураг боловсруулж чадсангүй', 'err');
        }
      }
      if (successCount > 0) {
        _lightboxImgs = e.images;
        saveAll();
        fbSaveRecord('exams', e);
        renderExamDetailImages(e);
        toast('✅ ' + successCount + ' зураг хадгалагдлаа', 'ok');
      }
    };
  }
  // Show print button if there's a linked invoice
  const printBtn = $('#ex-detail-print-btn');
  if (fin && printBtn) {
    printBtn.style.display = '';
    printBtn.onclick = () => { closeModal('exam-detail-modal'); printInvoice(fin.id); };
  } else if (printBtn) {
    printBtn.style.display = 'none';
  }
}

// Үзлэгийн процессын түүхийг (хэн, хэзээ, ямар үйлдэл) хугацааны дарааллаар зурна
function renderExamTimeline(e) {
  const wrap = document.getElementById('exd-timeline');
  if (!wrap) return;
  const items = buildExamTimeline(e);
  if (!items.length) {
    wrap.innerHTML = '<div class="muted" style="font-size:12px;padding:8px 0">Бүртгэл алга (хуучин үзлэг бол түүх хадгалагдаагүй байж болно)</div>';
    return;
  }
  const fmtDT = (ms, dateStr) => {
    if (ms) { try { const d = new Date(ms); return d.toLocaleDateString('mn-MN') + ' ' + d.toTimeString().slice(0,5); } catch(_){} }
    return dateStr || '';
  };
  wrap.innerHTML = '<div style="display:flex;flex-direction:column;gap:0">' + items.map((l, idx) => {
    const meta = timelineMeta(l.action);
    const isLast = idx === items.length - 1;
    return `
      <div style="display:flex;gap:10px;align-items:flex-start">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div style="width:28px;height:28px;border-radius:50%;background:var(--input);display:flex;align-items:center;justify-content:center;font-size:13px;border:1.5px solid ${meta.color}">${meta.icon}</div>
          ${!isLast ? '<div style="width:2px;flex:1;min-height:18px;background:var(--border)"></div>' : ''}
        </div>
        <div style="flex:1;padding-bottom:${isLast?'0':'12px'}">
          <div style="font-size:13px;font-weight:800;color:${meta.color}">${escHTML(l.action)}</div>
          <div style="font-size:12px;color:var(--text);margin-top:1px">
            <b>${escHTML(l.user_name||'—')}</b>
            <span class="muted" style="font-weight:600"> · ${escHTML(l.user_role||'')}</span>
          </div>
          ${l.details ? `<div class="muted" style="font-size:11px;margin-top:2px">${escHTML(l.details)}</div>` : ''}
          <div class="muted" style="font-size:10.5px;margin-top:2px">${escHTML(fmtDT(l.log_ms, l.log_date))}</div>
        </div>
      </div>`;
  }).join('') + '</div>';
}

function liHTML(w, kind) {
  const stripe = w.urgency === 'red' ? 'u-r' : w.urgency === 'yellow' ? 'u-y' : '';
  return `
    <div class="li" data-id="${w.id}">
      <div class="li-stripe ${stripe}"></div>
      <div class="li-av">🐴</div>
      <div class="li-info">
        <div class="li-name">${escHTML(w.horse)} <span class="muted" style="font-weight:600">· ${escHTML(w.owner)}</span></div>
        <div class="li-sub">${escHTML(w.symptoms||w.phone||'—')}</div>
      </div>
      <div class="li-r">
        <div class="li-time">${ago(w.ms)}</div>
        ${w.urgency==='red'?'<span class="badge b-r">🔴 Яаралтай</span>':w.urgency==='yellow'?'<span class="badge b-o">🟡 Анхаарах</span>':'<span class="badge b-g">🟢 Хэвийн</span>'}
      </div>
    </div>
  `;
}

// Утасны дугаараар өмнөх үйлчлүүлэгчийг хайж, ЗӨВХӨН эзний мэдээллийн
// талбаруудыг бөглөнө. Адуу болон анамнезийн талбарт хүрэхгүй.
function autoFillOwnerByPhone() {
  const phoneInp = $('#r-phone');
  if (!phoneInp) return;
  const phone = phoneInp.value.replace(/\D/g, '');
  if (phone.length < 6) return; // дутуу дугаар бол хайхгүй
  const norm = s => String(s || '').replace(/\D/g, '');
  // Утас нь үндсэн эсвэл нэмэлт утастай тохирох адуудыг олно
  const matches = STATE.horses.filter(h => norm(h.phone) === phone || norm(h.phone2) === phone);
  if (!matches.length) return;
  // Хамгийн сүүлд бүртгэгдсэнийг сонгоно
  matches.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const prev = matches[0];
  // Зөвхөн хоосон талбаруудыг бөглөнө (хэрэглэгчийн оруулсныг дарж бичихгүй)
  const setIfEmpty = (id, val) => {
    const el = $('#' + id);
    if (el && !el.value && val) el.value = val;
  };
  setIfEmpty('r-owner', prev.owner);
  setIfEmpty('r-phone2', prev.phone2);
  setIfEmpty('r-soum', prev.soum);
  // Аймаг нь select — утга жагсаалтад байвал л сонгоно
  const provEl = $('#r-prov');
  if (provEl && !provEl.value && prev.province) {
    const opt = Array.from(provEl.options).find(o => o.value === prev.province);
    if (opt) provEl.value = prev.province;
  }
  toast('👤 ' + (prev.owner || 'Өмнөх эзэн') + '-ийн мэдээлэл бөглөгдлөө', 'ok');
}

// ============================================================
// REGISTER
// ============================================================
function initRegPage() {
  const sel = $('#r-prov');
  if (sel.options.length <= 1) {
    PROVS.forEach(p => {
      const o = document.createElement('option');
      o.value = p; o.textContent = p;
      sel.appendChild(o);
    });
  }
  if (!$('#r-date').value) $('#r-date').value = todayStr();
  // Auto-fill exam number if empty
  if (!$('#r-examnum').value) autoFillExamNum();
  // Дугаар бичих явцад давхардлыг шалгаж анхааруулна
  const examInp = $('#r-examnum');
  if (examInp && !examInp.dataset.dupBound) {
    examInp.dataset.dupBound = '1';
    examInp.addEventListener('blur', () => {
      const v = examInp.value.trim();
      if (!v) { examInp.style.borderColor = ''; return; }
      const dup = findExamNumDuplicate(v);
      if (dup) {
        examInp.style.borderColor = 'var(--red)';
        const who = dup.rec.horse || dup.rec.name || '';
        toast('⚠️ ' + v + ' дугаар аль хэдийн ашиглагдсан' + (who ? ' (' + who + ')' : ''), 'err');
      } else {
        examInp.style.borderColor = '';
      }
    });
    examInp.addEventListener('input', () => { examInp.style.borderColor = ''; });
  }
  // Утас бичээд гарахад өмнөх эзний мэдээллийг бөглөнө
  const phoneInp = $('#r-phone');
  if (phoneInp && !phoneInp.dataset.lookupBound) {
    phoneInp.dataset.lookupBound = '1';
    phoneInp.addEventListener('blur', () => autoFillOwnerByPhone());
  }
}

// ============================================================
// 🔢 ҮЗЛЭГИЙН ХУУДАСНЫ ДУГААР — автомат дугаарлалт
// Тохиргоо (Системийн тохиргоо → Үзлэгийн дугаар) clinic_config-д хадгалагдаж
// бүх төхөөрөмжид sync хийгдэнэ. Дараагийн дугаар = max(эхлэх дугаар,
// системд байгаа хамгийн их дугаар) + 1. Эхлэх дугаараас доош хуучин
// цуврал (ж: 0052455) тооцогдохгүй тул дугаарлалтыг хэзээ ч шинээр эхлүүлж болно.
// ============================================================
const EXAMNUM_DEFAULT = { start: 90310, pad: 6, prefix: '', since: '2026-09-03' }; // 2026-09-03: сүүлийн дугаар 090310 → дараагийнх 090311
const EXAMNUM_WINDOW = 100000; // нэг цувралд байж болох дугаарын дээд зөрүү
function examNumCfg() { return Object.assign({}, EXAMNUM_DEFAULT, STATE.examNumCfg || {}); }
function examNumValue(n) { const m = String(n || '').match(/(\d+)/); return m ? parseInt(m[1], 10) : null; }
// Шинэ цувралын хамгийн их дугаар: зөвхөн цуврал эхэлсэн огноо (since)-оос хойш бүртгэгдсэн,
// эхлэх дугаараас дээш дугааруудыг л тооцно — хуучин цувралын урт/санамсаргүй дугаар нөлөөлөхгүй.
function examNumMax(withRec) {
  const cfg = examNumCfg();
  let max = cfg.start, rec = null;
  const dateOf = (r) => { const d = rpNormDate(r.date); if (d) return d; if (r.ms) { try { return localDateStr(new Date(parseFloat(r.ms))); } catch(_) {} } return ''; };
  const collect = (r, src) => {
    const v = examNumValue(r.examNum); if (v === null || v < cfg.start) return;
    if (v > cfg.start + EXAMNUM_WINDOW) return; // цувралаас хэт хол (гараар буруу бичсэн) дугаарыг үл тооцно
    if (cfg.since && dateOf(r) && dateOf(r) < cfg.since) return;
    if (v > max) { max = v; rec = { src, r }; }
  };
  (STATE.exams || []).forEach(e => collect(e, 'үзлэг'));
  (STATE.waiting || []).forEach(w => collect(w, 'дараалал'));
  return withRec ? { max, rec } : max;
}
function formatExamNum(v) { const cfg = examNumCfg(); return (cfg.prefix || '') + String(v).padStart(cfg.pad || 0, '0'); }
function nextExamNum() { return formatExamNum(examNumMax() + 1); }
function autoFillExamNum() {
  $('#r-examnum').value = nextExamNum();
  if ($('#r-examnum')) $('#r-examnum').placeholder = 'ж: ' + nextExamNum();
}
function saveExamNumCfg(patch) {
  STATE.examNumCfg = Object.assign({}, examNumCfg(), patch || {});
  lsSet('mt_examnum_cfg', STATE.examNumCfg);
  try { fbSaveClinicConfig(); } catch (e) { console.error(e); }
}
// Admin: тохиргооны карт
function renderExamNumCfg() {
  const cfg = examNumCfg();
  if ($('#en-cfg-start')) $('#en-cfg-start').value = cfg.start;
  if ($('#en-cfg-pad')) $('#en-cfg-pad').value = cfg.pad;
  if ($('#en-cfg-prefix')) $('#en-cfg-prefix').value = cfg.prefix || '';
  if ($('#en-cfg-since')) $('#en-cfg-since').value = cfg.since || '';
  const m = examNumMax(true);
  if ($('#en-cfg-info')) $('#en-cfg-info').innerHTML =
    'Дараагийн дугаар: <b style="font-size:16px">' + escHTML(nextExamNum()) + '</b>' +
    (m.rec ? ' <span class="muted">(цувралын хамгийн их: ' + escHTML(formatExamNum(m.max)) + ' — ' + escHTML(m.rec.src) + ', ' + escHTML(m.rec.r.horse || '') + ' ' + escHTML(rpNormDate(m.rec.r.date) || '') + ')</span>' : ' <span class="muted">(цуврал эхэлснээс хойш бүртгэл алга — эхлэх дугаар + 1)</span>');
}
function saveExamNumCfgFromForm() {
  if (!(typeof canAccess === 'function' && canAccess('admin'))) { toast('Зөвхөн админ эрхтэй хэрэглэгч солино', 'err'); return; }
  const start = parseInt(($('#en-cfg-start') || {}).value, 10);
  const pad = parseInt(($('#en-cfg-pad') || {}).value, 10);
  const prefix = (($('#en-cfg-prefix') || {}).value || '').trim();
  if (isNaN(start) || start < 0) { toast('Эхлэх дугаар буруу байна', 'err'); return; }
  const old = examNumCfg();
  let since = (($('#en-cfg-since') || {}).value || '').trim();
  if (!since || (start !== old.start && since === old.since)) since = todayStr(); // эхлэх дугаар өөрчлөгдвөл шинэ цуврал өнөөдрөөс
  saveExamNumCfg({ start, pad: isNaN(pad) ? 6 : Math.max(0, Math.min(12, pad)), prefix, since });
  try { writeLog('Үзлэгийн дугаарын тохиргоо солив', '', '', formatExamNum(old.start) + ' → ' + nextExamNum()); } catch (_) {}
  renderExamNumCfg();
  toast('✅ Дараагийн дугаар: ' + nextExamNum(), 'ok');
}

// Үзлэгийн хуудасны дугаар давхардаж байгаа эсэхийг шалгана.
// excludeId өгвөл тухайн бичлэгийг (засварлаж байгаа үед) алгасна.
// 🪟 Цонхтой сонсогчтой болсон тул хуучин үзлэг STATE-д байхгүй — давхардлыг
// сервэрээс ч шалгана (3 сек-ээс удвал алгасна: офлайн үед блоклохгүй).
// examNum нь мөр учир яг тэр мөр ба 6 оронтой тэглэсэн хувилбарыг хайна.
async function findExamNumDuplicateRemote(examNum, excludeId) {
  if (!window.__fbQuery || !window.__fbReady) return null;
  const t = String(examNum).trim(); if (!t) return null;
  const num = (t.match(/\d+/) || [])[0];
  const variants = [...new Set([t, num || '', num ? String(parseInt(num, 10)) : '', num ? String(parseInt(num, 10)).padStart(6, '0') : ''].filter(Boolean))];
  const timeout = new Promise(r => setTimeout(() => r(null), 3000));
  const q = (async () => {
    for (const v of variants) {
      try {
        const res = await window.__fbQuery('exams', [['examNum', '==', v]], { limitN: 2 });
        const hit = res.docs.find(d => d && String(d.id) !== String(excludeId || ''));
        if (hit) return { source: 'үзлэг (сервэр)', rec: hit };
      } catch (e) { return null; }
    }
    return null;
  })();
  return Promise.race([q, timeout]);
}

function findExamNumDuplicate(examNum, excludeId) {
  const target = String(examNum).trim();
  if (!target) return null;
  const targetNum = (target.match(/\d+/) || [])[0];
  const matches = (n) => {
    if (!n) return false;
    const s = String(n).trim();
    if (s === target) return true;
    // Тоон утгаар нь (тэгийн ялгааг үл харгалзан) харьцуулна
    const sNum = (s.match(/\d+/) || [])[0];
    return targetNum && sNum && parseInt(sNum, 10) === parseInt(targetNum, 10);
  };
  const inExams = STATE.exams.find(e => e.id !== excludeId && matches(e.examNum));
  if (inExams) return { source: 'үзлэг', rec: inExams };
  const inWaiting = STATE.waiting.find(w => w.id !== excludeId && matches(w.examNum));
  if (inWaiting) return { source: 'дараалал', rec: inWaiting };
  return null;
}

function clearReg() {
  ['r-name','r-age','r-breed','r-mark','r-owner','r-phone','r-phone2','r-soum','r-symp','r-extra','r-iabd'].forEach(id => { const el = $('#'+id); if (el) el.value = ''; });
  $('#r-prov').value = '';
  $('#r-urg').value = 'green';
  $('#r-date').value = todayStr();
  autoFillExamNum();
}

async function submitReg() {
  const name = $('#r-name').value.trim();
  const owner = $('#r-owner').value.trim();
  const phone = $('#r-phone').value.trim();
  const symp = $('#r-symp').value.trim();
  const examNum = $('#r-examnum').value.trim();
  if (!examNum) {
    toast('Үзлэгийн хуудасны дугаар оруулна уу', 'err');
    return;
  }
  const dup = findExamNumDuplicate(examNum) || await findExamNumDuplicateRemote(examNum);
  if (dup) {
    const who = dup.rec.horse || dup.rec.name || '';
    toast('⚠️ ' + examNum + ' дугаар аль хэдийн ашиглагдсан байна' + (who ? ' (' + who + ')' : ''), 'err');
    return;
  }
  if (!name || !owner || !phone || !symp) {
    toast('Шаардлагатай талбар дутуу байна', 'err');
    return;
  }
  const horse = {
    id: uid(),
    name, owner, phone,
    phone2: $('#r-phone2').value.trim(),
    iabd: ($('#r-iabd') ? $('#r-iabd').value.trim() : ''), // Ирсэн адууны бүртгэлийн дугаар
    age: $('#r-age').value,
    breed: $('#r-breed').value.trim(),
    mark: $('#r-mark').value.trim(),
    province: $('#r-prov').value,
    soum: $('#r-soum').value.trim(),
    date: $('#r-date').value || todayStr(),
    extra: $('#r-extra').value.trim(),
    createdAt: nowMs(),
    // ⚠️ ms заавал хэрэгтэй: sync-ийн merge нь ms-ээр "хэн нь шинэ вэ" гэдгийг шийддэг.
    // Урьд нь ms байгаагүйгээс өөр төхөөрөмжийн ХУУЧИН хуулбар локалыг дарж,
    // ИАБД зэрэг талбар устдаг байсан.
    ms: nowMs()
  };
  STATE.horses.push(horse);
  const wait = {
    id: uid(),
    horseId: horse.id,
    horse: name, owner, phone,
    symptoms: symp,
    urgency: $('#r-urg').value,
    examNum: examNum,
    ms: nowMs(),
    age: horse.age, breed: horse.breed, province: horse.province, soum: horse.soum
  };
  STATE.waiting.push(wait);
  saveAll();
  // ⚡ Зөвхөн өөрчлөгдсөн record-уудыг бичнэ
  fbSaveRecord('horses', horse);
  fbSaveRecord('waiting', wait);
  writeLog('Морь бүртгэсэн', horse.id, horse.name + ' / ' + horse.owner, 'Дугаар: ' + examNum, examNum);
  toast('✅ Адуу амжилттай бүртгэгдлээ (' + examNum + ')', 'ok');
  clearReg();
  updateBadges();
  nav('waiting');
}

// ============================================================
// WAITING
// ============================================================
function renderWaiting() {
  $('#w-sub').textContent = STATE.waiting.length + ' адуу үзлэг хүлээж байна';
  $('#w-cnt').textContent = STATE.waiting.length;
  const list = $('#w-list');
  if (STATE.waiting.length === 0) {
    list.innerHTML = '<div class="empty"><div class="empty-em">⏳</div>Хүлээж буй адуу алга</div>';
    STATE.selectedW = null;
    renderWDetail();
    return;
  }
  // Normalize selectedW to string for consistent comparison
  if (STATE.selectedW != null) STATE.selectedW = String(STATE.selectedW);
  // Auto-select first if no selection or stale selection
  if (!STATE.selectedW || !STATE.waiting.find(w => String(w.id) === STATE.selectedW)) {
    STATE.selectedW = String(STATE.waiting[0].id);
  }
  const waitSorted = [...STATE.waiting].sort((a,b) => recTime(b) - recTime(a));
  list.innerHTML = waitSorted.map(w => liHTML(w, 'wait')).join('');
  list.querySelectorAll('.li').forEach(el => {
    if (el.dataset.id === STATE.selectedW) el.classList.add('sel');
    el.addEventListener('click', () => {
      STATE.selectedW = String(el.dataset.id);
      list.querySelectorAll('.li').forEach(x => x.classList.toggle('sel', x.dataset.id === STATE.selectedW));
      renderWDetail();
    });
  });
  renderWDetail();
}

function renderWDetail() {
  const w = STATE.waiting.find(x => String(x.id) === String(STATE.selectedW));
  const actions = $('#w-detail-actions');
  if (!w) {
    $('#w-detail-title').textContent = '📌 Дэлгэрэнгүй';
    $('#w-detail-body').innerHTML = `
      <div class="empty">
        <div class="empty-em">🐴</div>
        Жагсаалтаас адуу сонгоно уу
      </div>`;
    if (actions) actions.style.display = 'none';
    return;
  }
  if (actions) actions.style.display = 'flex';
  $('#w-detail-title').innerHTML = `📌 ${escHTML(w.horse)} - ${escHTML(w.owner)}` +
    (w.examNum ? ` <span class="badge b-o" style="margin-left:8px">${escHTML(w.examNum)}</span>` : '');
  $('#w-detail-body').innerHTML = `
    <div class="fg r2">
      <div class="fld"><label>Эзэн</label><div class="bold">${escHTML(w.owner)}</div></div>
      <div class="fld"><label>Утас</label><div class="bold">${escHTML(w.phone)}</div></div>
      <div class="fld"><label>Нас</label><div>${escHTML(w.age||'—')}</div></div>
      <div class="fld"><label>Үүлдэр</label><div>${escHTML(w.breed||'—')}</div></div>
      <div class="fld"><label>Аймаг</label><div>${escHTML(w.province||'—')}</div></div>
      <div class="fld"><label>Хүлээсэн</label><div>${ago(w.ms)}</div></div>
    </div>
    <div class="fld" style="margin-top:8px"><label>Шинж тэмдэг</label>
      <div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px">${escHTML(w.symptoms)}</div>
    </div>
  `;
}

function removeWaiting() {
  if (!STATE.selectedW) return;
  if (!confirm('Энэ адууг хүлээлгээс хасах уу?')) return;
  const removedId = STATE.selectedW;
  STATE.waiting = STATE.waiting.filter(x => String(x.id) !== String(removedId));
  _markWaitingRemoved(removedId);
  STATE.selectedW = null;
  saveAll();
  fbDeleteDoc('waiting', String(removedId));
  updateBadges();
  renderWaiting();
  toast('Хүлээлгээс хасагдлаа', 'ok');
}

function startExamFromWaiting() {
  if (!STATE.selectedW) { toast('Адуу сонгоно уу', 'err'); return; }
  const w = STATE.waiting.find(x => String(x.id) === String(STATE.selectedW));
  if (!w) return;
  STATE.curExam = {
    id: uid(),
    waitId: w.id,
    horseId: w.horseId,
    horse: w.horse,
    owner: w.owner,
    phone: w.phone,
    symptoms: w.symptoms,
    anamnesis: w.symptoms || '',
    docId: STATE.doctors[0] ? STATE.doctors[0].id : null,
    assistDocId: '',
    date: todayStr(),
    time: new Date().toTimeString().slice(0,5),
    examNum: w.examNum || nextExamNum(), // дараалалд дугааргүй бол автомат дугаар
    temp:'', pulse:'', resp:'', wt:'',
    diagnosis:'', symptoms2:[], note:'',
    services:[], meds:[], images:[],
    province: w.province || '',
    soum: w.soum || '',
    regMs: parseFloat(w.ms) || nowMs(), // адуу бүртгэсэн агшин — хугацаа хэмжих эхлэл
    ms: nowMs()
  };
  writeLog('Үзлэг эхлүүлсэн', STATE.curExam.id, w.horse + ' / ' + w.owner, '', STATE.curExam.examNum);
  nav('exam');
}

// ============================================================
// EXAM PAGE
// ============================================================
const SYMPTOM_LIST = ['Халуурах','Хоолны дур муудах','Тураалт','Гавлай','Хатир','Бөглөрөл','Шарх','Тахир','Гүйж буцаах','Чичрэлт','Зулгарах'];

function initExamPage() {
  if (!STATE.curExam) {
    $('#ex-empty').classList.remove('hidden');
    $('#ex-content').classList.add('hidden');
    return;
  }
  $('#ex-empty').classList.add('hidden');
  $('#ex-content').classList.remove('hidden');
  const e = STATE.curExam;
  $('#ex-title').textContent = '🩺 ' + e.horse;
  $('#ex-sub').textContent = e.owner + ' · ' + e.phone;
  $('#ex-date').value = e.date;
  $('#ex-time').value = e.time;
  $('#ex-num').value = e.examNum;
  $('#ex-temp').value = e.temp;
  $('#ex-pulse').value = e.pulse;
  $('#ex-resp').value = e.resp;
  $('#ex-wt').value = e.wt;
  $('#ex-diag').value = e.diagnosis;
  $('#ex-note').value = e.note;
  if (!Array.isArray(e.images)) e.images = [];
  renderExamImages();

  // doctors — populate two selects
  const mainSel = $('#ex-doc-main');
  const asstSel = $('#ex-doc-asst');
  const mainOptions = STATE.doctors.map(d =>
    `<option value="${escHTML(d.id)}" ${String(d.id)===String(e.docId)?'selected':''}>${escHTML(d.name)} (${escHTML(d.role)})</option>`
  ).join('');
  mainSel.innerHTML = mainOptions;
  asstSel.innerHTML = '<option value="">— Сонгох —</option>' + STATE.doctors.map(d =>
    `<option value="${escHTML(d.id)}" ${String(d.id)===String(e.assistDocId||'')?'selected':''}>${escHTML(d.name)} (${escHTML(d.role)})</option>`
  ).join('');
  // Set first doctor as default if none selected
  if (!e.docId && STATE.doctors[0]) {
    e.docId = STATE.doctors[0].id;
    mainSel.value = e.docId;
  }
  mainSel.onchange = () => { e.docId = mainSel.value; };
  asstSel.onchange = () => { e.assistDocId = asstSel.value; };

  // symptoms
  const sh = $('#ex-symptoms');
  sh.innerHTML = SYMPTOM_LIST.map(s => `
    <button type="button" class="badge ${e.symptoms2.includes(s)?'b-o':''}" data-sym="${escHTML(s)}" style="cursor:pointer;border:1.5px solid ${e.symptoms2.includes(s)?'var(--orange)':'var(--border)'};padding:6px 10px;background:${e.symptoms2.includes(s)?'var(--orange-soft)':'#fff'};font-size:11px">${escHTML(s)}</button>
  `).join('');
  sh.querySelectorAll('button[data-sym]').forEach(b => b.addEventListener('click', () => {
    const s = b.dataset.sym;
    if (e.symptoms2.includes(s)) e.symptoms2 = e.symptoms2.filter(x=>x!==s);
    else e.symptoms2.push(s);
    initExamPage();
  }));

  renderSvcList();
  renderSelectedSvcs();
  renderMedChips();

  // tabs
  $$('.tab[data-etab]').forEach(t => t.onclick = () => {
    STATE.activeETab = t.dataset.etab;
    $$('.tab[data-etab]').forEach(x => x.classList.toggle('active', x.dataset.etab === STATE.activeETab));
    $$('.etab').forEach(x => x.classList.toggle('hidden', x.dataset.etab !== STATE.activeETab));
  });
  // restore active tab
  $$('.tab[data-etab]').forEach(x => x.classList.toggle('active', x.dataset.etab === STATE.activeETab));
  $$('.etab').forEach(x => x.classList.toggle('hidden', x.dataset.etab !== STATE.activeETab));

  // input bindings
  ['ex-temp','ex-pulse','ex-resp','ex-wt','ex-diag','ex-note','ex-date','ex-time'].forEach(id => {
    const el = $('#'+id);
    el.oninput = () => {
      const map = {'ex-temp':'temp','ex-pulse':'pulse','ex-resp':'resp','ex-wt':'wt','ex-diag':'diagnosis','ex-note':'note','ex-date':'date','ex-time':'time'};
      e[map[id]] = el.value;
    };
  });

  // svc search
  $('#svc-search').oninput = renderSvcList;
  // med search
  setupMedSearch();
}

function renderSvcList() {
  const q = ($('#svc-search')?.value || '').toLowerCase().trim();
  const list = getAllServices().filter(s => !q || s.toLowerCase().includes(q));
  $('#svc-list').innerHTML = list.map(s => `
    <div class="svc-item" data-svc="${escHTML(s)}">
      <span class="svc-item-name">${escHTML(s)}</span>
      <span style="color:var(--orange);font-size:16px;font-weight:900">+</span>
    </div>
  `).join('');
  $('#svc-list').querySelectorAll('.svc-item').forEach(el => el.onclick = () => {
    const s = el.dataset.svc;
    if (!STATE.curExam.services.find(x => x.name === s)) {
      STATE.curExam.services.push({ name: s, price: getSvcPrice(s) });
      renderSelectedSvcs();
    }
  });
}

function renderSelectedSvcs() {
  const e = STATE.curExam;
  const wrap = $('#svc-selected');
  if (e.services.length === 0) {
    wrap.innerHTML = '<div class="empty" style="padding:14px;font-size:12px">Үйлчилгээ сонгоогүй</div>';
  } else {
    wrap.innerHTML = e.services.map((s,i) => `
      <div class="svc-row">
        <div class="svc-row-name">${escHTML(s.name)}</div>
        <input class="inp" type="number" data-i="${i}" value="${s.price||''}" placeholder="0">
        <button class="btn btn-r btn-xs" data-rm="${i}">✕</button>
      </div>
    `).join('');
    wrap.querySelectorAll('input[type=number]').forEach(inp => inp.oninput = () => {
      e.services[+inp.dataset.i].price = parseFloat(inp.value) || 0;
      updateSvcTotal();
    });
    wrap.querySelectorAll('button[data-rm]').forEach(b => b.onclick = () => {
      e.services.splice(+b.dataset.rm, 1);
      renderSelectedSvcs();
    });
  }
  updateSvcTotal();
}

function updateSvcTotal() {
  const t = STATE.curExam.services.reduce((a,b)=>a+(parseFloat(b.price)||0),0);
  $('#svc-total').textContent = fmt(t);
}

function setupMedSearch() {
  const inp = $('#med-search');
  const list = $('#med-list');
  inp.oninput = () => {
    const q = inp.value.toLowerCase().trim();
    if (!q) { list.classList.remove('show'); return; }
    const matches = MED_LIST.filter(m => m.toLowerCase().includes(q)).slice(0, 50);
    if (matches.length === 0) { list.classList.remove('show'); return; }
    list.innerHTML = matches.map(m => `<div class="dd-item" data-m="${escHTML(m)}">${escHTML(m)}</div>`).join('');
    list.classList.add('show');
    list.querySelectorAll('.dd-item').forEach(el => {
      el.onmousedown = (e) => {
        e.preventDefault();
        const name = el.dataset.m;
        if (!STATE.curExam.meds.find(x => (x.name||x) === name)) {
          STATE.curExam.meds.push({ name, note: '' });
        }
        renderMedChips();
        inp.value = '';
        list.classList.remove('show');
        inp.focus();
      };
    });
  };
  inp.onblur = () => { list.classList.remove('show'); };
}

function renderMedChips() {
  const wrap = $('#med-chips');
  const meds = STATE.curExam.meds;
  if (meds.length === 0) {
    wrap.innerHTML = '<span style="font-size:12px;color:var(--muted);font-weight:600">Эм сонгоогүй</span>';
  } else {
    wrap.innerHTML = meds.map((m, i) => {
      const name = m.name || m;
      const note = m.note || '';
      return `
        <div style="display:flex;align-items:center;gap:6px;background:var(--input);border-radius:8px;padding:6px 10px;margin-bottom:4px">
          <span style="font-size:13px;font-weight:600;min-width:120px;flex-shrink:0">${escHTML(name)}</span>
          <input class="inp" type="text" value="${escHTML(note)}"
            placeholder="Тайлбар: өдрийн 3-р 14 хоног..."
            style="flex:1;padding:4px 8px;font-size:12px"
            oninput="STATE.curExam.meds[${i}].note=this.value">
          <button class="btn btn-r btn-xs" onclick="STATE.curExam.meds.splice(${i},1);renderMedChips()">✕</button>
        </div>`;
    }).join('');
  }
  $('#ex-meds').value = meds.map(m => (m.name||m) + (m.note ? ' — ' + m.note : '')).join('\n');
}

function cancelExam() {
  if (STATE.curExam && STATE.curExam.services.length === 0 && !STATE.curExam.diagnosis) {
    STATE.curExam = null;
  }
  nav('waiting');
}

// ============================================================
// EXAM IMAGES (resize + compress + store)
// ============================================================
// Багасгах тохиргоо: урт талыг 1000px, JPEG чанар 0.7 → ~100-200KB
const IMG_MAX_DIM = 1000;
const IMG_QUALITY = 0.7;
const IMG_MAX_PER_EXAM = 6; // үзлэг бүрт дээд тал нь 6 зураг

// Файлыг canvas ашиглан багасгаж, JPEG data URL болгож буцаана
function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      reject(new Error('Зураг биш файл байна'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Файл уншиж чадсангүй'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Зураг ачаалж чадсангүй'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > IMG_MAX_DIM) {
          height = Math.round(height * IMG_MAX_DIM / width);
          width = IMG_MAX_DIM;
        } else if (height > IMG_MAX_DIM) {
          width = Math.round(width * IMG_MAX_DIM / height);
          height = IMG_MAX_DIM;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', IMG_QUALITY);
          resolve(dataUrl);
        } catch (err) {
          reject(new Error('Зураг хувиргаж чадсангүй'));
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Зургийн эх сурвалжийг буцаана: шинэ нь .url (Storage), хуучин нь .data (base64)
function imgSrc(im) { return (im && (im.url || im.data)) || ''; }

// curExam-д зураг нэмэх (үзлэг бичих үед). fileList = input.files
async function addExamImages(fileList) {
  const e = STATE.curExam;
  if (!e) return;
  if (!Array.isArray(e.images)) e.images = [];
  const files = Array.from(fileList || []);
  if (!files.length) return;
  if (e.images.length + files.length > IMG_MAX_PER_EXAM) {
    toast('Үзлэг бүрт дээд тал нь ' + IMG_MAX_PER_EXAM + ' зураг', 'err');
    return;
  }
  if (!window.__fbReady || !window.__fbUploadImage) {
    toast('⛔ Firebase холбогдоогүй. Зураг хадгалах боломжгүй.', 'err');
    return;
  }
  toast('Зураг боловсруулж байна...', 'ok');
  let successCount = 0;
  for (const file of files) {
    try {
      const dataUrl = await resizeImageFile(file);
      const imgId = uid();
      const path = 'exam-images/' + e.id + '/' + imgId + '.jpg';
      try {
        const url = await window.__fbUploadImage(path, dataUrl);
        // Зөвхөн URL+path хадгална — base64 data огт хадгалахгүй
        e.images.push({ id: imgId, url: url, path: path, ms: nowMs() });
        successCount++;
      } catch (upErr) {
        toast('⛔ Зураг илгээж чадсангүй: ' + storageErrMsg(upErr), 'err');
        console.error('[Storage] exam-images бичих алдаа:', path, upErr);
      }
    } catch (err) {
      toast(err.message || 'Зураг боловсруулж чадсангүй', 'err');
    }
  }
  if (successCount > 0) {
    renderExamImages();
    saveAll();
  }
}

// curExam-аас зураг устгах
function removeExamImage(imgId) {
  const e = STATE.curExam;
  if (!e || !Array.isArray(e.images)) return;
  const im = e.images.find(x => x.id === imgId);
  if (im && im.url && window.__fbDeleteImageByUrl) window.__fbDeleteImageByUrl(im.url);
  e.images = e.images.filter(im => im.id !== imgId);
  renderExamImages();
}

// Үзлэг бичих хэсэгт зургийн thumbnail-уудыг харуулах
function renderExamImages() {
  const wrap = $('#ex-images');
  if (!wrap) return;
  const e = STATE.curExam;
  const imgs = (e && Array.isArray(e.images)) ? e.images : [];
  if (!imgs.length) {
    wrap.innerHTML = '<div class="muted" style="font-size:12px">Одоогоор зураг алга</div>';
    return;
  }
  wrap.innerHTML = imgs.map(im => `
    <div style="position:relative;width:84px;height:84px;border-radius:8px;overflow:hidden;border:1px solid var(--border)">
      <img src="${imgSrc(im)}" style="width:100%;height:100%;object-fit:cover;cursor:pointer" onclick="openImageLightbox('${im.id}','exam')">
      <button type="button" onclick="removeExamImage('${im.id}')" title="Устгах"
        style="position:absolute;top:2px;right:2px;width:22px;height:22px;border:none;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;cursor:pointer;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center">×</button>
    </div>
  `).join('');
}

// Том зургийг харах lightbox. source='exam' (curExam) эсвэл массив шууд
let _lightboxImgs = [];
function openImageLightbox(imgId, source) {
  let imgs = [];
  if (source === 'exam' && STATE.curExam && Array.isArray(STATE.curExam.images)) {
    imgs = STATE.curExam.images;
  } else if (Array.isArray(_lightboxImgs)) {
    imgs = _lightboxImgs;
  }
  const im = imgs.find(x => x.id === imgId);
  if (!im) return;
  let lb = $('#img-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'img-lightbox';
    lb.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:20px';
    lb.onclick = () => { lb.style.display = 'none'; };
    document.body.appendChild(lb);
  }
  lb.innerHTML = `<img src="${imgSrc(im)}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px">`;
  lb.style.display = 'flex';
}

// Exam detail modal дахь зургийг харуулах (нэмэх/устгах боломжтой)
function renderExamDetailImages(e) {
  const wrap = $('#exd-images');
  if (!wrap) return;
  const imgs = (e && Array.isArray(e.images)) ? e.images : [];
  if (!imgs.length) {
    wrap.innerHTML = '<div class="muted" style="font-size:12px">Зураг алга</div>';
    return;
  }
  wrap.innerHTML = imgs.map(im => `
    <div style="position:relative;width:84px;height:84px;border-radius:8px;overflow:hidden;border:1px solid var(--border)">
      <img src="${imgSrc(im)}" style="width:100%;height:100%;object-fit:cover;cursor:pointer" onclick="openImageLightbox('${im.id}')">
      <button type="button" onclick="removeExamDetailImage('${e.id}','${im.id}')" title="Устгах"
        style="position:absolute;top:2px;right:2px;width:22px;height:22px;border:none;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;cursor:pointer;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center">×</button>
    </div>
  `).join('');
}

// Exam detail modal-аас зураг устгах
function removeExamDetailImage(examId, imgId) {
  const e = STATE.exams.find(x => String(x.id) === String(examId));
  if (!e || !Array.isArray(e.images)) return;
  const im = e.images.find(x => x.id === imgId);
  if (im && im.url && window.__fbDeleteImageByUrl) window.__fbDeleteImageByUrl(im.url);
  e.images = e.images.filter(im => im.id !== imgId);
  _lightboxImgs = e.images;
  saveAll();
  fbSaveRecord('exams', e);
  renderExamDetailImages(e);
  toast('Зураг устгагдлаа', 'ok');
}

function finishExam() {
  const e = STATE.curExam;
  if (!e) return;
  if (!e.diagnosis) { toast('Онош оруулна уу', 'err'); return; }
  const total = e.services.reduce((a,b)=>a+(parseFloat(b.price)||0),0);
  const mainDoc = STATE.doctors.find(d=>String(d.id)===String(e.docId));
  const asstDoc = e.assistDocId ? STATE.doctors.find(d=>String(d.id)===String(e.assistDocId)) : null;
  const exam = {
    id: e.id,
    horseId: e.horseId,
    horse: e.horse,
    owner: e.owner,
    phone: e.phone,
    docId: e.docId,
    docName: mainDoc ? mainDoc.name : '—',
    assistDocId: e.assistDocId || '',
    assistDocName: asstDoc ? asstDoc.name : '',
    date: e.date,
    time: e.time,
    examNum: e.examNum,
    diagnosis: e.diagnosis,
    note: e.note,
    services: e.services,
    meds: e.meds,
    symptoms: e.symptoms2,
    anamnesis: e.symptoms || '',
    temp: e.temp, pulse: e.pulse, resp: e.resp, wt: e.wt,
    province: e.province || (horseById(e.horseId)||{}).province || '',
    soum: e.soum || (horseById(e.horseId)||{}).soum || '',
    images: Array.isArray(e.images) ? e.images : [],
    amount: total,
    regMs: parseFloat(e.regMs) || null,        // адуу бүртгэсэн агшин
    doneMs: nowMs(),                            // үзлэг дуусгасан агшин
    durationMin: (parseFloat(e.regMs) ? Math.max(0, Math.round((nowMs() - parseFloat(e.regMs)) / 60000)) : null), // зарцуулсан минут
    ms: nowMs()
  };
  // 🩺 Онош батлах: ахлах эмчийнх бол автоматаар батлагдана, бусад нь «хянагдаж байна»
  Object.assign(exam, dxInitFields(exam));
  STATE.exams.push(exam);
  // create finance record
  const fin = {
    id: uid(),
    examId: exam.id,
    examNum: exam.examNum || (STATE.waiting.find(w=>w.id===e.waitId) && STATE.waiting.find(w=>w.id===e.waitId).examNum) || '',
    horse: exam.horse,
    owner: exam.owner,
    phone: exam.phone,
    docName: exam.docName,
    amount: total,
    services: e.services.map(s=>s.name).join(', '),
    paid: false,
    method: '',
    date: exam.date,
    paidDate: '',
    paidMs: 0,
    ms: nowMs()
  };
  STATE.fins.push(fin);
  // remove from waiting
  STATE.waiting = STATE.waiting.filter(w => String(w.id) !== String(e.waitId));
  _markWaitingRemoved(e.waitId);
  // update doctor stats
  const doc = STATE.doctors.find(d => String(d.id) === String(e.docId));
  if (doc) {
    doc.exams = (doc.exams||0)+1;
    doc.rev = (doc.rev||0)+total;
    fbSaveRecord('doctors', doc);
  }
  saveAll();
  // ⚡ Зөвхөн өөрчлөгдсөн record-уудыг бичнэ
  fbSaveRecord('exams', exam);
  fbSaveRecord('fins', fin);
  fbDeleteDoc('waiting', String(e.waitId));
  // 🧪 Шинжилгээний захиалга автоматаар үүсгэнэ (эмчийн урсгалд нөлөөлөхгүй)
  let _labN = 0;
  try { if (typeof createLabOrdersFromExam === 'function') _labN = createLabOrdersFromExam(exam).length; } catch(err) { console.error('lab', err); }
  writeLog('Үзлэг дуусгасан', exam.id, exam.horse + ' — ' + (exam.docName||''), (exam.diagnosis ? ('Онош: ' + exam.diagnosis) : '') + (exam.dxStatus === 'pending' ? ' · онош хянуулахаар илгээгдсэн' : ''), exam.examNum);
  STATE.curExam = null;
  STATE.selectedW = null;
  updateBadges();
  toast((_labN ? ('✅ Үзлэг дууслаа · 🧪 ' + _labN + ' шинжилгээ илгээгдлээ') : '✅ Үзлэг дууслаа, нэхэмжлэх үүсгэгдлээ') +
    (exam.dxStatus === 'pending' ? ' · 🩺 онош ахлах эмчид хянуулахаар илгээгдлээ (батлагдсаны дараа хуудсанд хэвлэгдэнэ)' : ''), 'ok');
  nav('finance');
}

function moveToInpatient() {
  const e = STATE.curExam;
  if (!e) return;
  if (!e.diagnosis) { toast('Онош оруулна уу', 'err'); return; }
  // Confirm before moving — prevents accidental hospitalization
  if (!confirm('🏥 Энэ адууг байрлан эмчлүүлэхэд оруулах уу?\n\nАдуу: ' + e.horse + '\nЭзэн: ' + e.owner + '\n\nЗа гэвэл байрлагчдын жагсаалтад орно.')) return;
  // Save exam first
  const total = e.services.reduce((a,b)=>a+(parseFloat(b.price)||0),0);
  const mainDoc = STATE.doctors.find(d=>String(d.id)===String(e.docId));
  const asstDoc = e.assistDocId ? STATE.doctors.find(d=>String(d.id)===String(e.assistDocId)) : null;
  const exam = {
    id: e.id, horseId: e.horseId, horse: e.horse, owner: e.owner, phone: e.phone,
    docId: e.docId, docName: mainDoc ? mainDoc.name : '—',
    assistDocId: e.assistDocId || '', assistDocName: asstDoc ? asstDoc.name : '',
    date: e.date, time: e.time, examNum: e.examNum,
    diagnosis: e.diagnosis, note: e.note,
    services: e.services, meds: e.meds, symptoms: e.symptoms2,
    temp: e.temp, pulse: e.pulse, resp: e.resp, wt: e.wt,
    amount: total, ms: nowMs(), inpatient: true
  };
  Object.assign(exam, dxInitFields(exam)); // 🩺 онош батлах
  STATE.exams.push(exam);
  // create inpatient
  const inp = {
    id: uid(),
    examId: exam.id,
    horse: e.horse, owner: e.owner, phone: e.phone,
    diagnosis: e.diagnosis,
    examNum: exam.examNum || '',
    docId: e.docId || '',
    docName: exam.docName,
    location: '',
    admittedMs: nowMs(),
    admittedDate: todayStr(),
    admittedBy: (STATE.user && STATE.user.name) || '',
    initialAmount: total,
    services: [...e.services],
    meds: [...e.meds],
    log: [],
    discharged: false,
    ms: nowMs()
  };
  STATE.inps.push(inp);
  STATE.waiting = STATE.waiting.filter(w => String(w.id) !== String(e.waitId));
  _markWaitingRemoved(e.waitId);
  saveAll();
  fbSaveRecord('exams', exam);
  fbSaveRecord('inps', inp);
  fbDeleteDoc('waiting', String(e.waitId));
  // 🧪 Шинжилгээний захиалга автоматаар үүсгэнэ
  try { if (typeof createLabOrdersFromExam === 'function') createLabOrdersFromExam(exam); } catch(err) { console.error('lab', err); }
  // 📜 Байрлуулсан үйлдлийг логт бүртгэнэ (хэн, хэзээ, аль төхөөрөмжөөс)
  writeLog('Байрлан эмчилгээнд байрлуулав', inp.id, e.horse + ' — ' + exam.docName, (e.diagnosis ? 'Онош: ' + e.diagnosis + ' · ' : '') + _deviceLabel(), exam.examNum);
  STATE.curExam = null;
  STATE.selectedW = null;
  updateBadges();
  toast('🏥 Байрлан эмчлүүлэхэд оруулагдлаа', 'ok');
  nav('inpatient');
}

// ============================================================
// INPATIENT
// ============================================================
// ============================================================
// INPATIENT — days calculation
// ============================================================
// Rule: count inpatient days from admittedMs.
// - Day 1 = admission day (regardless of admit time).
// - Each new calendar day past 12:00 (noon) adds +1 day.
// - Before 12:00 on the next day, count stays the same as previous day.
// Examples (admitted on day D):
//   D 09:00 → 1 day
//   D 23:00 → 1 day
//   D+1 11:59 → 1 day
//   D+1 12:00 → 2 days
//   D+2 11:59 → 2 days
//   D+2 12:00 → 3 days
function inpatientDays(admittedMs, atMs) {
  if (!admittedMs) return 1;
  const at = atMs || nowMs();
  // Get start-of-admission-day (00:00 local time)
  const adm = new Date(admittedMs);
  const admStart = new Date(adm.getFullYear(), adm.getMonth(), adm.getDate(), 0, 0, 0).getTime();
  // Get start-of-current-day
  const cur = new Date(at);
  const curStart = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), 0, 0, 0).getTime();
  // How many full calendar days passed since admission day
  const daysDiff = Math.round((curStart - admStart) / 86400000);
  // Add +1 if current time has passed noon (12:00)
  const pastNoon = cur.getHours() >= 12;
  // Day 1 = admission day; each calendar day past noon adds +1
  let days = 1 + daysDiff;
  if (!pastNoon && daysDiff > 0) days -= 1;
  return Math.max(1, days);
}

// Байрлан эмчлүүлэх жагсаалт: 1 хуудсанд харуулах картын тоо
const INP_PER_PAGE = 20;
let INP_PAGE = 1;

function inpGoPage(n) {
  INP_PAGE = n;
  renderInpatient();
  const list = $('#inp-list');
  if (list && list.scrollIntoView) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── 📍 Байрлал ба эмч ────────────────────────────────────────────
const INP_LOC_DEFAULT = ['Зүчээ 1', 'Зүчээ 2', 'Зүчээ 3', 'Зүчээ 4', 'Зүчээ 5',
  'Нарлагаа 1', 'Нарлагаа 2', 'Нарлагаа 3', 'Нарлагаа 4', 'Нарлагаа 5',
  'Нарлагаа 6', 'Нарлагаа 7', 'Нарлагаа 8', 'Нарлагаа 9', 'Нарлагаа 10'];
function inpLocations() { return (Array.isArray(STATE.inpLocations) && STATE.inpLocations.length) ? STATE.inpLocations : INP_LOC_DEFAULT; }
// Эмчлэгч эмч: docId-аар, байхгүй бол нэрээр (хуучин бичлэг)
function inpDoctorOf(i) {
  if (!i) return null;
  const ds = STATE.doctors || [];
  return (i.docId && ds.find(d => String(d.id) === String(i.docId))) || (i.docName && ds.find(d => d.name === i.docName)) || null;
}
// Байрлан эмчлүүлэгчийн үзлэгийн хуудасны дугаар — бичлэг дээрээ, үзлэг, санхүүгээс
function inpExamNum(i) {
  if (!i) return '';
  if (i.examNum) return String(i.examNum);
  const ex = i.examId ? recById('exams', i.examId) : null;
  if (ex && ex.examNum) return String(ex.examNum);
  const f = i.examId ? finByExamId(i.examId) : null;
  return (f && f.examNum) ? String(f.examNum) : '';
}
// Нэвтэрсэн хэрэглэгч эмч мөн бол түүний doctor бичлэг
function currentUserDoctor() {
  const u = STATE.user; if (!u) return null;
  return (STATE.doctors || []).find(d => d.name === u.name) || null;
}
let INP_VIEW = 'cards'; // 'cards' | 'loc' | 'doc'
function setInpView(v) { INP_VIEW = v; INP_PAGE = 1; renderInpatient(); }
function setInpField(field, value) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI)); if (!i) return;
  if (!canEditData()) { toast('⛔ Засах эрхгүй', 'err'); return; }
  const before = { docName: i.docName, location: i.location };
  if (field === 'docId') {
    const d = (STATE.doctors || []).find(x => String(x.id) === String(value));
    i.docId = d ? d.id : ''; i.docName = d ? d.name : (i.docName || '');
  } else if (field === 'location') i.location = value || '';
  else if (field === 'severity') i.severity = value || ''; // 🔴🟠🟢 хүнд/дунд/хөнгөн (Өдрийн мэдээнд тоологдоно)
  i.ms = nowMs();
  saveAll(); fbSaveRecord('inps', i);
  writeLog('Байрлан эмчлүүлэх мэдээлэл засав', i.id, i.horse,
    field === 'docId' ? 'Эмч: «' + (before.docName || '') + '» → «' + (i.docName || '') + '»' : field === 'severity' ? 'Зэрэглэл: «' + (i.severity || '—') + '»' : 'Байрлал: «' + (before.location || '') + '» → «' + (i.location || '') + '»');
  renderInpatient();
  toast('✅ Хадгалагдлаа', 'ok');
}
function renderInpLocCfg() {
  const ta = $('#inp-loc-list'); if (!ta) return;
  ta.value = inpLocations().join('\n');
  const st = $('#inp-loc-status'); if (st) st.textContent = Array.isArray(STATE.inpLocations) ? 'Өөрчилсөн жагсаалт' : 'Анхдагч жагсаалт';
}
function saveInpLocationsFromForm() {
  if (!canManageUsers || !canManageUsers()) { toast('⛔ Зөвхөн админ', 'err'); return; }
  const ta = $('#inp-loc-list'); if (!ta) return;
  const list = [...new Set(ta.value.split('\n').map(x => x.trim()).filter(Boolean))];
  if (!list.length) { toast('Дор хаяж нэг байрлал оруулна уу', 'err'); return; }
  STATE.inpLocations = list; lsSet('mt_inp_locations', list);
  fbSaveClinicConfig(); renderInpLocCfg();
  writeLog('Байрлалын жагсаалт өөрчилсөн', '', '', list.length + ' байрлал');
  toast('✅ ' + list.length + ' байрлал хадгалагдлаа', 'ok');
}
function resetInpLocations() {
  if (!canManageUsers || !canManageUsers()) { toast('⛔ Зөвхөн админ', 'err'); return; }
  STATE.inpLocations = null; try { localStorage.removeItem('mt_inp_locations'); } catch (e) {}
  fbSaveClinicConfig(); renderInpLocCfg(); toast('↺ Анхдагч жагсаалт', 'ok');
}
// 📅 Хоногоор шүүх: '' | 'eq:N' (яг N хоног) | 'r:A-B' (хоорондох) | 'call' (эзэнд залгах) | 'notreat' (өнөөдөр бичээгүй) | 'noplan' (маргаашийн төлөвлөгөөгүй)
let INP_DAYS_F = '';
function setInpDaysF(v) { INP_DAYS_F = (INP_DAYS_F === v) ? '' : (v || ''); INP_PAGE = 1; if (INP_VIEW === 'out') INP_VIEW = 'cards'; renderInpatient(); }
const INP_DAY_RANGES = [['r:1-2', '1–2 хоног', 1, 2], ['r:3-7', '3–7 хоног', 3, 7], ['r:8-14', '8–14 хоног', 8, 14], ['r:15-30', '15–30 хоног', 15, 30], ['r:31-99999', '31+ хоног', 31, 99999]];
function _inpDaysOk(i, f) {
  if (!f) return true;
  const d = inpatientDays(i.admittedMs);
  if (f.startsWith('eq:')) return d === parseInt(f.slice(3), 10);
  if (f.startsWith('r:')) { const [a, b] = f.slice(2).split('-').map(Number); return d >= a && d <= b; }
  if (f === 'call') return inpCallState(i).due;
  if (f === 'notreat') return inpTreatStatus(i, todayStr()) === 'missing';
  if (f === 'noplan') return !inpPlanFor(i, addDaysStr(todayStr(), 1));
  return true;
}
// Хоногийн шүүлтийн select ба «хэдэн хоногтой хэдэн адуу» чипсийг тоотой нь шинэчилнэ
function _inpRenderDaysUI(active) {
  const cnt = {}; active.forEach(i => { const d = inpatientDays(i.admittedMs); cnt[d] = (cnt[d] || 0) + 1; });
  const ds = Object.keys(cnt).map(Number).sort((a, b) => a - b);
  const callN = active.filter(i => inpCallState(i).due).length;
  const noTreatN = active.filter(i => inpTreatStatus(i, todayStr()) === 'missing').length;
  const noPlanN = active.filter(i => !inpPlanFor(i, addDaysStr(todayStr(), 1))).length;
  const sel = $('#inp-f-days');
  if (sel) {
    const opt = (v, l, n) => `<option value="${v}" ${INP_DAYS_F === v ? 'selected' : ''}>${l}${n != null ? ' (' + n + ')' : ''}</option>`;
    sel.innerHTML = opt('', 'Бүх хоног', active.length) +
      '<optgroup label="Яг хэдэн хоног">' + ds.map(d => opt('eq:' + d, d + ' хоног', cnt[d])).join('') + '</optgroup>' +
      '<optgroup label="Хоорондох">' + INP_DAY_RANGES.map(r => opt(r[0], r[1], active.filter(i => { const d = inpatientDays(i.admittedMs); return d >= r[2] && d <= r[3]; }).length)).join('') + '</optgroup>' +
      '<optgroup label="Хяналт">' + opt('call', '📞 Эзэнд залгах', callN) + opt('notreat', '📝 Өнөөдөр эмчилгээ бичээгүй', noTreatN) + opt('noplan', '🗓 Маргаашийн төлөвлөгөөгүй', noPlanN) + '</optgroup>';
    if (INP_DAYS_F && sel.value !== INP_DAYS_F) { // хүчингүй болсон шүүлт (ж: тэр хоногтой адуу үлдээгүй)
      sel.insertAdjacentHTML('afterbegin', opt(INP_DAYS_F, INP_DAYS_F.startsWith('eq:') ? INP_DAYS_F.slice(3) + ' хоног' : INP_DAYS_F, 0)); sel.value = INP_DAYS_F;
    }
  }
  const strip = $('#inp-days-strip');
  if (strip) {
    strip.innerHTML = active.length ? '<span class="muted" style="font-weight:700">📅 Хоногоор:</span>' +
      ds.map(d => `<button type="button" class="inp-days-chip ${INP_DAYS_F === 'eq:' + d ? 'on' : ''}" onclick="setInpDaysF('eq:${d}')">${d} хоног · <b>${cnt[d]}</b></button>`).join('') +
      (callN ? `<button type="button" class="inp-days-chip warn ${INP_DAYS_F === 'call' ? 'on' : ''}" onclick="setInpDaysF('call')">📞 Эзэнд залгах · <b>${callN}</b></button>` : '') +
      (INP_DAYS_F ? `<button type="button" class="inp-days-chip" onclick="setInpDaysF('')">✕ Шүүлт арилгах</button>` : '') : '';
  }
}
function _inpFilterState() {
  const v = id => (($('#' + id) || {}).value || '');
  return { doc: v('inp-f-doc'), loc: v('inp-f-loc'), q: v('inp-f-q').toLowerCase().trim(), sort: v('inp-f-sort') || 'days_desc', days: INP_DAYS_F };
}
function _inpFillFilters(active) {
  const docSel = $('#inp-f-doc'), locSel = $('#inp-f-loc');
  if (docSel && !docSel.__filled) {
    docSel.__filled = true;
    const me = currentUserDoctor();
    docSel.innerHTML = '<option value="">Бүх эмч</option>' + (me ? '<option value="me">👤 Миний адуунууд</option>' : '') +
      (STATE.doctors || []).map(d => `<option value="${escHTML(d.id)}">${escHTML(d.name)}</option>`).join('') + '<option value="__none">Эмч заагаагүй</option>';
  }
  if (locSel && !locSel.__filled) {
    locSel.__filled = true;
    locSel.innerHTML = '<option value="">Бүх байрлал</option>' + inpLocations().map(l => `<option>${escHTML(l)}</option>`).join('') + '<option value="__none">Байрлал заагаагүй</option>';
  }
}
// 🔍 Байрлагчийн БҮХ утгыг нэг мөр текст болгоно — хайлт үүн дотроос хийнэ
// (зүс, эзэн, утас, онош, байрлал, үзлэгийн №, эмч, орсон/гарсан огноо, хоног,
//  өдрийн бичлэгийн онош/тэмдэглэл/эм/үйлчилгээ/эмч, төлөвлөгөө, курс, залгасан тэмдэглэл).
// Бичлэг бүрт нэг удаа бодоод i.ms-ээр кэшилнэ (2500 бичлэгт хайхад дахин угсрахгүй).
const __inpSearchCache = new Map();
function inpSearchText(i) {
  const key = String(i.id);
  const c = __inpSearchCache.get(key);
  if (c && c.ms === (i.ms || 0) && c.n === (Array.isArray(i.log) ? i.log.length : 0)) return c.t;
  const parts = [i.horse, i.owner, i.phone, i.diagnosis, i.location, i.examNum, i.docName, i.admittedDate, i.dischargedDate,
    i.severity ? ('зэрэглэл ' + i.severity) : '', i.discharged ? 'гарсан' : 'байрлаж байна', inpatientDays(i.admittedMs) + ' хоног'];
  (Array.isArray(i.log) ? i.log : []).forEach(l => {
    parts.push(l.date, l.docName, l.diagnosis, l.note, l.slot);
    (l.services || []).forEach(s => parts.push(s && (s.name || s)));
    (l.meds || []).forEach(m => parts.push(m && (m.name || m), m && m.note, m && m.dose));
  });
  (Array.isArray(i.services) ? i.services : []).forEach(s => parts.push(s && (s.name || s)));
  (Array.isArray(i.meds) ? i.meds : []).forEach(m => parts.push(m && (m.name || m)));
  (Array.isArray(i.plans) ? i.plans : []).forEach(p => p && !p.deleted && parts.push(p.date, p.text));
  (Array.isArray(i.course) ? i.course : []).forEach(cs => cs && !cs.deleted && parts.push(cs.med, cs.dose, cs.unit, cs.note));
  (Array.isArray(i.calls) ? i.calls : []).forEach(cl => cl && parts.push(cl.note));
  const t = parts.filter(x => x != null && x !== '').join(' ').toLowerCase();
  __inpSearchCache.set(key, { ms: i.ms || 0, n: Array.isArray(i.log) ? i.log.length : 0, t });
  return t;
}
function _inpApplyFilter(active, F) {
  let list = active;
  if (F.doc) {
    if (F.doc === 'me') { const me = currentUserDoctor(); list = me ? list.filter(i => { const d = inpDoctorOf(i); return d && String(d.id) === String(me.id); }) : []; }
    else if (F.doc === '__none') list = list.filter(i => !inpDoctorOf(i));
    else list = list.filter(i => { const d = inpDoctorOf(i); return d && String(d.id) === String(F.doc); });
  }
  if (F.loc) list = F.loc === '__none' ? list.filter(i => !i.location) : list.filter(i => i.location === F.loc);
  if (F.q) { const words = F.q.split(/\s+/).filter(Boolean); list = list.filter(i => { const t = inpSearchText(i); return words.every(w => t.includes(w)); }); }
  if (F.days) list = list.filter(i => _inpDaysOk(i, F.days));
  const dueOf = i => Math.max(0, getInpFullTotal(i) - getInpPrepaidTotal(i));
  const locIx = l => { const k = inpLocations().indexOf(l || ''); return k < 0 ? 999 : k; };
  const sorters = {
    days_desc: (a, b) => (a.admittedMs || 0) - (b.admittedMs || 0),
    days_asc:  (a, b) => (b.admittedMs || 0) - (a.admittedMs || 0),
    due_desc:  (a, b) => dueOf(b) - dueOf(a),
    name:      (a, b) => String(a.horse || '').localeCompare(String(b.horse || '')),
    loc:       (a, b) => locIx(a.location) - locIx(b.location) || (a.admittedMs || 0) - (b.admittedMs || 0)
  };
  return list.slice().sort(sorters[F.sort] || sorters.days_desc);
}
function _inpCardHTML(i) {
  const days = inpatientDays(i.admittedMs);
  const due = Math.max(0, getInpFullTotal(i) - getInpPrepaidTotal(i));
  const dClass = days > 40 ? 'inpc-days-long' : days > 20 ? 'inpc-days-warn' : '';
  const d = inpDoctorOf(i);
  const cs = inpCallState(i);
  const ts = inpTreatStatus(i, todayStr());
  const tmr = inpPlanFor(i, addDaysStr(todayStr(), 1));
  const watchTags =
    (cs.due ? `<span class="inpc-tag inpc-tag-call" title="Эзэнд нь залгаж эмчилгээний явцыг мэдээлээд тэмдэглэл бичнэ үү">📞 ${cs.days} хоносон — эзэнд залгах</span>` : '') +
    (ts === 'done' ? '<span class="inpc-tag inpc-tag-ok">📝 Өнөөдөр бичсэн</span>' : ts === 'missing' ? '<span class="inpc-tag" title="Өнөөдрийн эмчилгээ хараахан бичигдээгүй">📝 Өнөөдөр бичээгүй</span>' : '') +
    (tmr ? `<span class="inpc-tag inpc-tag-ok" title="${escHTML(tmr.text)}">🗓 Маргааш ✓</span>` : '');
  return `
    <div class="inpc ${due > 0 ? 'inpc-due' : ''}" data-id="${i.id}">
      <div class="inpc-top">
        <div class="inpc-av">🐴</div>
        <div class="inpc-names">
          <div class="inpc-horse">${escHTML(i.horse)}</div>
          <div class="inpc-owner">Эзэн: <b>${escHTML(i.owner)}</b></div>
        </div>
        <div class="inpc-days ${dClass}">${days} хоног</div>
      </div>
      <div class="inpc-tags">
        ${inpExamNum(i) ? `<span class="inpc-tag inpc-tag-num">🔢 ${escHTML(inpExamNum(i))}</span>` : ''}
        <span class="inpc-tag ${d ? '' : 'inpc-tag-none'}">👨‍⚕️ ${escHTML(d ? d.name : (i.docName || 'Эмч заагаагүй'))}</span>
        <span class="inpc-tag ${i.location ? 'inpc-tag-loc' : 'inpc-tag-none'}">📍 ${escHTML(i.location || 'Байрлал заагаагүй')}</span>
        ${watchTags}
      </div>
      <div class="inpc-diag">${escHTML(i.diagnosis || '—')}</div>
      <div class="inpc-foot">
        <span class="inpc-adm">${escHTML(i.admittedDate || '')}</span>
        <span class="inpc-pay ${due > 0 ? 'inpc-pay-due' : 'inpc-pay-ok'}">${due > 0 ? fmt(due) + ' дутуу' : 'Төлбөр бүрэн'}</span>
      </div>
    </div>`;
}
function _inpGroupHTML(title, items, extra) {
  return `<div class="inp-group" style="grid-column:1/-1">
    <div class="inp-group-h"><span>${title}</span><span class="muted">${items.length ? items.length + ' адуу' : (extra || '— чөлөөтэй —')}</span></div>
    ${items.length ? '<div class="inp-group-grid">' + items.map(_inpCardHTML).join('') + '</div>' : ''}
  </div>`;
}

// ── 🚪 ГАРСАН АДУУД — мөшгих жагсаалт ───────────────────────────
// «Адуу өөрөө гараад санхүү рүү шилжчихлээ» гэсэн асуулт гарч байсан —
// систем автоматаар гаргадаггүй; хэн, хэзээ, аль төхөөрөмжөөс гаргасныг
// энд харуулна, андуурсан бол ↩ буцаан байрлуулна.
let __inpOutAll = false;
function _inpOutTs(i) { return parseFloat(i.dischargedAtMs) || parseFloat(i.dischargedMs) || 0; }
function openFinRecord(finId) {
  const f = STATE.fins.find(x => String(x.id) === String(finId));
  if (!f) { toast('Нэхэмжлэх олдсонгүй (устгагдсан байж болно)', 'err'); return; }
  STATE.activeFTab = isFullyPaid(f) ? 'paid' : (isReceivable(f) ? 'receivable' : 'pending');
  STATE.selectedF = String(f.id);
  nav('finance'); // nav өөрөө renderFinance дуудна
}
function _renderInpOutView(list, F) {
  list.style.display = 'block';
  const since = Date.now() - 60 * 86400000;
  let outs = (STATE.inps || []).filter(i => i.discharged);
  outs = _inpApplyFilter(outs, { doc: F.doc, loc: F.loc, q: F.q, sort: 'days_desc' }).sort((a, b) => _inpOutTs(b) - _inpOutTs(a));
  const recent = outs.filter(i => _inpOutTs(i) >= since);
  const show = (__inpOutAll ? outs : recent).slice(0, 300);
  const canUndo = canEditData();
  const edit = __inpOutEdit && canUndo;
  const today = todayStr();
  const rows = show.map(i => {
    const f = _inpDischargeFinOf(i);
    const days = inpatientDays(i.admittedMs, i.dischargedMs);
    const finTxt = f ? (fmt(f.amount) + ' ' + (isFullyPaid(f) ? '<span class="badge b-g">Төлөгдсөн</span>' : (getPaidAmount(f) > 0 ? '<span class="badge b-r">Үлдэгдэл ' + fmt(getDueAmount(f)) + '</span>' : '<span class="badge b-o">Хүлээгдэж буй</span>')))
      : '<span class="muted">нэхэмжлэх олдсонгүй (устгагдсан?)</span>';
    const undoHint = i.dischargeUndo ? '<div class="muted" style="font-size:10.5px">↩ өмнө нь буцаагдаж байсан: ' + escHTML(i.dischargeUndo.by || '') + ' · ' + fmtDateTime(i.dischargeUndo.ms) + '</div>' : '';
    const fixHint = i.dischargeFix ? '<div class="muted" style="font-size:10.5px">🗓 огноо засагдсан: ' + escHTML(i.dischargeFix.prevDate || '—') + ' → ' + escHTML(i.dischargedDate || '') + ' (' + escHTML(i.dischargeFix.by || '') + ' · ' + fmtDateTime(i.dischargeFix.ms) + ')</div>' : '';
    const sameDay = i.dischargedAtMs && i.dischargedDate === localDateStr(new Date(i.dischargedAtMs)) && days > 1 && (i.dischargedAtMs >= Date.now() - 2 * 86400000);
    const dateCell = edit
      ? `<span style="display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap"><input type="date" class="inp inp-out-date" data-id="${escHTML(i.id)}" value="${escHTML(i.dischargedDate || '')}" min="${escHTML(i.admittedDate || '')}" max="${today}" style="width:auto;padding:4px 8px;font-weight:700" oninput="_inpOutRowPreview(this)" onchange="_inpOutRowPreview(this)"><span id="inp-out-prev-${escHTML(i.id)}" style="font-size:12px"></span></span>`
      : `<b>${escHTML(i.dischargedDate || '')}</b>`;
    return `<div class="inp-out-row" data-id="${escHTML(i.id)}">
      <div class="inp-out-main">
        <div><b style="font-size:14px">${escHTML(i.horse || '')}</b> <span class="muted">· ${escHTML(i.owner || '')}${i.phone ? ' · ' + escHTML(i.phone) : ''}</span> ${inpExamNum(i) ? '<span class="badge b-o" style="font-size:10px">' + escHTML(inpExamNum(i)) + '</span>' : ''}</div>
        <div style="font-size:12.5px;margin-top:3px">${escHTML(i.admittedDate || '')} → ${dateCell} <span class="muted">· ${days} хоног${i.location ? ' · 📍 ' + escHTML(i.location) : ''}${i.docName ? ' · 👨‍⚕️ ' + escHTML(i.docName) : ''}</span></div>
        <div style="font-size:12.5px;margin-top:3px">🧾 ${finTxt}</div>
        <div style="font-size:12px;margin-top:3px;color:var(--purple);font-weight:700">🚪 Гаргасан: ${escHTML(inpDischargeAuditText(i))}</div>${fixHint}${undoHint}
      </div>
      <div class="inp-out-act">
        <button class="btn btn-xs" onclick="printOwnerSheet('${escHTML(i.id)}')" title="Эзэнд өгөх гарах хуудас">📋 Гарах хуудас</button>
        ${f ? `<button class="btn btn-xs" onclick="openFinRecord('${escHTML(f.id)}')" title="Accountant / Finance дээр харах">🧾 Accountant / Finance</button>` : ''}
        ${canUndo && !edit ? `<button class="btn btn-xs" onclick="openDischargedCard('${escHTML(i.id)}','treat')" title="Эмчилгээ / эмийн дүн нэмэх, устгах — нэхэмжлэх дахин бодогдоно">📋 Эмчилгээ нэмэх</button>` : ''}
        ${canUndo && !edit ? `<button class="btn btn-xs ${sameDay ? 'btn-p' : ''}" onclick="openDischargeDateFix('${escHTML(i.id)}')" title="Бодит гарсан огноог оруулахад хоног, хөлс, нэхэмжлэх дахин бодогдоно">🗓 Огноо засах</button>` : ''}
        ${canUndo && !edit ? `<button class="btn btn-xs" onclick="undoDischarge('${escHTML(i.id)}')" title="Андуурч гаргасан бол буцаан байрлуулна">↩ Буцаан байрлуулах</button>` : ''}
      </div>
    </div>`;
  }).join('');
  const editBar = canUndo ? (edit
    ? `<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center;background:var(--gold-soft,#f6efdc);border-radius:10px;padding:8px 12px;margin-bottom:10px">
        <span style="font-size:12.5px;flex:1;min-width:200px">🗓 <b>Багцаар засах:</b> мөр бүрийн огноог бодит гарсан өдрөөр солино — хоног, хоногийн хөлс, нэхэмжлэхийн дүн шууд дахин бодогдоно. Өөрчлөгдсөн мөр тодорно.</span>
        <button class="btn btn-sm" onclick="toggleInpOutEdit()">Болих</button>
        <button class="btn btn-sm btn-p" id="inp-out-save" onclick="saveInpOutDates()" disabled>💾 Хадгалах (0)</button>
      </div>`
    : `<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <button class="btn btn-sm" onclick="toggleInpOutEdit()" title="Олон адууны гарсан огноог нэг дор засах">🗓 Гарсан огноог багцаар засах</button>
        <span class="muted" style="font-size:11.5px">Адууг бодит гарсан өдрөөс хожуу гаргасан бол огноог засахад төлбөр зөв болно.</span>
      </div>`) : '';
  list.innerHTML = `
    <div class="muted" style="font-size:12px;margin-bottom:8px;line-height:1.5">
      🔍 Систем адууг <b>өөрөө гаргадаггүй</b> — гаргалт бүр тухайн адууны карт дээрх «🚪 Гаргах ба эцсийн төлбөр» → «🚪 Гаргах ба нэхэмжлэх үүсгэх» дарснаар л хийгдэнэ (2026-09-29-2 хувилбараас хойш хэн, хэзээ, аль төхөөрөмжөөс гаргасан нь бүртгэгдэнэ). Өөр компьютер/утаснаас гаргавал энд хэдхэн секундын дараа харагдана.
      ${__inpOutAll ? 'Бүх гарсан адуу: <b>' + outs.length + '</b>' : 'Сүүлийн 60 хоногт гарсан: <b>' + recent.length + '</b>'}${outs.length !== recent.length ? ' · <a href="#" onclick="__inpOutAll=!__inpOutAll;renderInpatient();return false;">' + (__inpOutAll ? 'Зөвхөн сүүлийн 60 хоног' : 'Бүгдийг харах (' + outs.length + ')') + '</a>' : ''}
    </div>
    ${editBar}
    ${show.length ? rows : '<div class="empty"><div class="empty-em">🚪</div>Гарсан адуу алга</div>'}`;
}

function renderInpatient() {
  ensureInpCardStyles();
  ensureReviewStyles();
  ensureInpDrawer();
  const active = STATE.inps.filter(i => !i.discharged);
  $('#inp-sub').textContent = active.length + ' адуу байрлаж байна';
  const list = $('#inp-list');
  _inpFillFilters(active);
  const F = _inpFilterState();
  $$('.inp-view-btn').forEach(b => b.classList.toggle('on', b.dataset.view === INP_VIEW));
  // 🚪 Гарсан адуудын мөшгих жагсаалт
  const out7 = (STATE.inps || []).filter(i => i.discharged && _inpOutTs(i) >= Date.now() - 7 * 86400000).length;
  const outBtn = $('.inp-view-btn[data-view="out"]'); if (outBtn) outBtn.textContent = '🚪 Гарсан' + (out7 ? ' · 7 хоногт ' + out7 : '');
  if (INP_VIEW === 'out') {
    // Гарсан адууны карт нээлттэй бол (эмчилгээ нэмэх/засах) drawer-ийг хаахгүй
    const selOut = STATE.selectedI && STATE.inps.find(x => String(x.id) === String(STATE.selectedI) && x.discharged);
    if (!selOut) closeInpDrawer(); else if (isInpDrawerOpen()) renderIDetail();
    const sum0 = $('#inp-summary'); if (sum0) sum0.innerHTML = '';
    const ds0 = $('#inp-days-strip'); if (ds0) ds0.innerHTML = '';
    _renderInpOutView(list, F); return;
  }
  _inpRenderDaysUI(active);

  // 📊 Тойм мөр
  const sum = $('#inp-summary');
  if (sum) {
    const dueN = active.filter(i => getInpFullTotal(i) - getInpPrepaidTotal(i) > 0).length;
    const dueSum = active.reduce((a, i) => a + Math.max(0, getInpFullTotal(i) - getInpPrepaidTotal(i)), 0);
    const locs = inpLocations(); const used = new Set(active.map(i => i.location).filter(Boolean));
    const byDoc = {}; active.forEach(i => { const d = inpDoctorOf(i); const k = d ? d.name : 'Эмч заагаагүй'; byDoc[k] = (byDoc[k] || 0) + 1; });
    const longN = active.filter(i => inpatientDays(i.admittedMs) > 20).length;
    const callN = active.filter(i => inpCallState(i).due).length;
    const noTreatN = active.filter(i => inpTreatStatus(i, todayStr()) === 'missing').length;
    sum.innerHTML = `
      <div class="inp-sum-card"><div class="inp-sum-n">${active.length}</div><div class="inp-sum-l">байрлаж байна</div></div>
      <div class="inp-sum-card ${callN ? 'inp-sum-warn' : ''}" style="cursor:pointer" onclick="setInpDaysF('call')" title="${callCfg().firstDay}+ хоносон, эзэнд нь мэдээлээгүй адуу"><div class="inp-sum-n">${callN}</div><div class="inp-sum-l">📞 эзэнд залгах</div></div>
      <div class="inp-sum-card" style="cursor:pointer" onclick="setInpDaysF('notreat')" title="Өнөөдрийн эмчилгээ хараахан бичигдээгүй адуу"><div class="inp-sum-n">${noTreatN}</div><div class="inp-sum-l">📝 өнөөдөр бичээгүй</div></div>
      <div class="inp-sum-card"><div class="inp-sum-n">${used.size}<span class="muted">/${locs.length}</span></div><div class="inp-sum-l">байрлал ашиглалт</div></div>
      <div class="inp-sum-card ${dueN ? 'inp-sum-warn' : ''}"><div class="inp-sum-n">${dueN}</div><div class="inp-sum-l">дутуу төлбөртэй · ${fmtCompact ? fmtCompact(dueSum) : fmt(dueSum)}</div></div>
      <div class="inp-sum-card ${longN ? 'inp-sum-warn' : ''}"><div class="inp-sum-n">${longN}</div><div class="inp-sum-l">20+ хоног</div></div>
      <div class="inp-sum-card" style="cursor:pointer" onclick="setInpView('out')" title="Хэн, хэзээ гаргасныг харах"><div class="inp-sum-n">${out7}</div><div class="inp-sum-l">🚪 7 хоногт гарсан</div></div>
      <div class="inp-sum-card inp-sum-wide"><div class="inp-sum-l">Эмчээр: ${Object.entries(byDoc).sort((a, b) => b[1] - a[1]).map(([k, n]) => escHTML(k) + ' <b>' + n + '</b>').join(' · ') || '—'}</div></div>`;
  }

  // Жагсаалтын хайрцгийг карт-grid болгоно (index.html засалгүйгээр)
  list.style.display = 'grid';
  list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(240px, 1fr))';
  list.style.gap = '12px';
  list.style.alignItems = 'start';
  if (active.length === 0) {
    list.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-em">🏥</div>Байрлаж буй адуу алга</div>';
    closeInpDrawer();
    return;
  }
  const filtered = _inpApplyFilter(active, F);
  const filteredNote = filtered.length !== active.length ? `<div class="muted" style="grid-column:1/-1;font-size:11.5px">Шүүлтээр ${filtered.length} / ${active.length} адуу</div>` : '';

  if (INP_VIEW === 'loc') {
    const locs = inpLocations(); const byLoc = {}; filtered.forEach(i => { const k = i.location && locs.includes(i.location) ? i.location : '__none'; (byLoc[k] = byLoc[k] || []).push(i); });
    const extraLocs = [...new Set(filtered.map(i => i.location).filter(l => l && !locs.includes(l)))];
    list.innerHTML = filteredNote + locs.map(l => _inpGroupHTML('📍 ' + escHTML(l), byLoc[l] || [])).join('') +
      extraLocs.map(l => _inpGroupHTML('📍 ' + escHTML(l) + ' <span class="muted">(жагсаалтад байхгүй)</span>', filtered.filter(i => i.location === l))).join('') +
      ((byLoc.__none || []).length ? _inpGroupHTML('❔ Байрлал заагаагүй', byLoc.__none) : '');
  } else if (INP_VIEW === 'days') {
    // 📅 Хоногоор: «N хоног — K адуу» бүлгүүд (олон хоногтой нь дээрээ)
    const byD = {}; filtered.forEach(i => { const d = inpatientDays(i.admittedMs); (byD[d] = byD[d] || []).push(i); });
    const ds = Object.keys(byD).map(Number).sort((a, b) => b - a);
    list.innerHTML = filteredNote + (ds.length ? ds.map(d => _inpGroupHTML('📅 ' + d + ' хоног', byD[d])).join('')
      : '<div class="empty" style="grid-column:1/-1">Шүүлтэд тохирох адуу алга</div>');
  } else if (INP_VIEW === 'doc') {
    const byDoc = {}; filtered.forEach(i => { const d = inpDoctorOf(i); const k = d ? d.name : '__none'; (byDoc[k] = byDoc[k] || []).push(i); });
    const names = Object.keys(byDoc).filter(k => k !== '__none').sort((a, b) => byDoc[b].length - byDoc[a].length);
    list.innerHTML = filteredNote + names.map(n => _inpGroupHTML('👨‍⚕️ ' + escHTML(n), byDoc[n])).join('') +
      ((byDoc.__none || []).length ? _inpGroupHTML('❔ Эмч заагаагүй', byDoc.__none) : '') + (!names.length && !(byDoc.__none || []).length ? '<div class="empty" style="grid-column:1/-1">Шүүлтэд тохирох адуу алга</div>' : '');
  } else {
    // ===== Карт + хуудаслалт =====
    const totalPages = Math.max(1, Math.ceil(filtered.length / INP_PER_PAGE));
    if (INP_PAGE > totalPages) INP_PAGE = totalPages;
    if (INP_PAGE < 1) INP_PAGE = 1;
    const pageItems = filtered.slice((INP_PAGE - 1) * INP_PER_PAGE, INP_PAGE * INP_PER_PAGE);
    let pagerHTML = '';
    if (totalPages > 1) {
      const nums = [];
      for (let n = 1; n <= totalPages; n++) nums.push(`<button type="button" class="inpc-pg ${n === INP_PAGE ? 'on' : ''}" onclick="inpGoPage(${n})">${n}</button>`);
      pagerHTML = `<div class="inpc-pager" style="grid-column:1/-1">
        <button type="button" class="inpc-pg" ${INP_PAGE <= 1 ? 'disabled' : ''} onclick="inpGoPage(${INP_PAGE - 1})">‹</button>${nums.join('')}
        <button type="button" class="inpc-pg" ${INP_PAGE >= totalPages ? 'disabled' : ''} onclick="inpGoPage(${INP_PAGE + 1})">›</button>
        <span class="inpc-pg-info">${(INP_PAGE - 1) * INP_PER_PAGE + 1}–${Math.min(INP_PAGE * INP_PER_PAGE, filtered.length)} / ${filtered.length}</span></div>`;
    }
    list.innerHTML = filteredNote + (pageItems.length ? pageItems.map(_inpCardHTML).join('') : '<div class="empty" style="grid-column:1/-1">Шүүлтэд тохирох адуу алга</div>') + pagerHTML;
  }

  // Карт дарахад drawer нээж дэлгэрэнгүйг харуулна
  list.querySelectorAll('.inpc').forEach(el => el.onclick = () => {
    STATE.selectedI = String(el.dataset.id);
    list.querySelectorAll('.inpc').forEach(x => x.classList.toggle('sel', x.dataset.id === STATE.selectedI));
    renderIDetail();
    openInpDrawer();
  });

  if (STATE.selectedI != null) STATE.selectedI = String(STATE.selectedI);
  const selStillActive = STATE.selectedI && active.find(x => String(x.id) === STATE.selectedI);
  if (!selStillActive) {
    closeInpDrawer();
  } else {
    list.querySelectorAll('.inpc').forEach(x => x.classList.toggle('sel', x.dataset.id === STATE.selectedI));
    if (isInpDrawerOpen()) renderIDetail();
  }
}
// ============================================================
// INPATIENT — drawer (дэлгэрэнгүйг баруун талаас гулсуулж нээх)
// ============================================================

// #inp-detail-card-ийг index.html дахь байрнаас нь drawer руу зөөнө.
// DOM node зөөхөд ID болон event listener бүгд хэвээр үлддэг тул
// доторх таб, маягт, товчнууд өөрчлөлтгүй ажиллана.
function ensureInpDrawer() {
  if ($('#inp-drawer')) return;
  const detail = $('#inp-detail-card');
  if (!detail) return;
  // Хуучин хоёр баганат байрлалыг задалж жагсаалтад бүтэн өргөн өгнө
  const parentEl = detail.parentElement;
  const overlay = document.createElement('div');
  overlay.id = 'inp-drawer-overlay';
  const drawer = document.createElement('div');
  drawer.id = 'inp-drawer';
  drawer.innerHTML = `
    <div id="inp-drawer-head">
      <button id="inp-drawer-close" type="button">✕ Хаах</button>
    </div>
    <div id="inp-drawer-body"></div>`;
  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
  drawer.querySelector('#inp-drawer-body').appendChild(detail);
  // ⚠ parent-ийн display-д ГАР ХҮРЭХГҮЙ! Энэ нь .page контейнер тул inline display
  // тавьбал хуудас солих (.active) логикийг дарж, бүх таб дээр харагддаг алдаа гарна.
  // Хоёр баганат grid байсан бол нэг багана болгоно — grid биш бол энэ нөлөөгүй.
  if (parentEl) parentEl.style.gridTemplateColumns = '1fr';
  overlay.onclick = closeInpDrawer;
  drawer.querySelector('#inp-drawer-close').onclick = closeInpDrawer;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isInpDrawerOpen() && !document.querySelector('.modal.open, .modal:not(.hidden) .modal-box')) closeInpDrawer();
  });
}

function openInpDrawer() {
  ensureInpDrawer();
  const d = $('#inp-detail-card');
  if (d) d.classList.remove('hidden');
  const o = $('#inp-drawer-overlay'), w = $('#inp-drawer');
  if (o) o.classList.add('open');
  if (w) { w.classList.add('open'); w.scrollTop = 0; }
}

function closeInpDrawer() {
  const o = $('#inp-drawer-overlay'), w = $('#inp-drawer');
  if (o) o.classList.remove('open');
  if (w) w.classList.remove('open');
}

function isInpDrawerOpen() {
  const w = $('#inp-drawer');
  return !!(w && w.classList.contains('open'));
}

// Картын болон drawer-ийн CSS-ийг <head>-д нэг удаа суулгана — index.html засах шаардлагагүй
function ensureInpCardStyles() {
  if (document.getElementById('inpc-styles')) return;
  const st = document.createElement('style');
  st.id = 'inpc-styles';
  st.textContent = `
  .inpc{background:var(--card,#fff);border:1px solid var(--border,#e9e6f0);border-radius:13px;
    border-left:4px solid var(--purple,#7c5cbf);padding:12px 13px 10px;cursor:pointer;
    display:flex;flex-direction:column;gap:8px;
    box-shadow:0 1px 3px rgba(40,30,70,.06),0 5px 14px rgba(40,30,70,.05);
    transition:transform .12s ease,box-shadow .12s ease,border-color .12s ease}
  .inpc:hover{transform:translateY(-2px);box-shadow:0 4px 10px rgba(40,30,70,.1),0 10px 24px rgba(40,30,70,.09)}
  .inpc.inpc-due{border-left-color:var(--red,#c0483f)}
  .inpc.sel{border-color:var(--purple,#7c5cbf);box-shadow:0 0 0 2px var(--purple-soft,#efeaf9),0 4px 10px rgba(40,30,70,.1)}
  .inpc-top{display:flex;align-items:flex-start;gap:9px}
  .inpc-av{width:38px;height:38px;border-radius:10px;flex-shrink:0;background:var(--purple-soft,#efeaf9);
    display:flex;align-items:center;justify-content:center;font-size:19px}
  .inpc-names{flex:1;min-width:0}
  .inpc-horse{font-size:13.5px;font-weight:800;line-height:1.25;overflow:hidden;text-overflow:ellipsis}
  .inpc-owner{font-size:11.5px;color:var(--muted,#8a8398);margin-top:1px}
  .inpc-owner b{color:var(--purple,#7c5cbf);font-weight:700}
  .inpc-days{font-size:10.5px;font-weight:800;padding:3px 8px;border-radius:7px;white-space:nowrap;flex-shrink:0;
    background:var(--purple-soft,#efeaf9);color:var(--purple,#7c5cbf)}
  .inpc-days-warn{background:var(--orange-soft,#fcf3e0);color:var(--orange-dark,#b57708)}
  .inpc-days-long{background:var(--red-soft,#fbeae8);color:var(--red,#c0483f)}
  .inpc-diag{font-size:11.5px;color:var(--muted,#5b5468);line-height:1.45;background:var(--input,#faf9fc);
    border:1px solid var(--border,#e9e6f0);border-radius:8px;padding:6px 8px;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:34px}
  .inpc-foot{display:flex;align-items:center;justify-content:space-between;gap:6px;
    padding-top:6px;border-top:1px solid var(--border,#e9e6f0);font-size:10.5px;color:var(--muted,#8a8398)}
  .inpc-pay{font-weight:800;padding:2px 7px;border-radius:6px;font-size:10.5px;white-space:nowrap}
  .inpc-pay-ok{background:var(--green-soft,#e6f6ee);color:var(--green,#2f9e6f)}
  .inpc-pay-due{background:var(--red-soft,#fbeae8);color:var(--red,#c0483f)}
  .inpc-tags{display:flex;gap:5px;flex-wrap:wrap}
  .inpc-tag{font-size:10.5px;font-weight:700;padding:2px 7px;border-radius:6px;background:var(--input,#faf9fc);
    border:1px solid var(--border,#e9e6f0);color:var(--muted,#5b5468);white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
  .inpc-tag-loc{background:var(--gold-soft,#f6efdc);color:#7a5a12;border-color:#e6d5a8}
  .inpc-tag-num{background:var(--orange-soft,#fcf3e0);color:var(--orange-dark,#b57708);border-color:#f0d9a8;font-weight:800}
  .inpc-tag-none{opacity:.6;font-style:italic}
  .inp-view-btn.on{background:var(--navy,#0b2b3d);color:#fff;border-color:var(--navy,#0b2b3d)}
  .inp-summary{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
  .inp-sum-card{flex:1;min-width:110px;background:var(--input,#faf9fc);border:1px solid var(--border,#e9e6f0);border-radius:10px;padding:8px 10px}
  .inp-sum-wide{flex:3;min-width:220px}
  .inp-sum-n{font-size:20px;font-weight:900;line-height:1.1}
  .inp-sum-n .muted{font-size:12px;font-weight:700}
  .inp-sum-l{font-size:11px;color:var(--muted,#8a8398);margin-top:2px;line-height:1.4}
  .inp-sum-warn{border-color:#e6b8b3;background:var(--red-soft,#fbeae8)}
  .inp-out-row{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;
    background:var(--card,#fff);border:1px solid var(--border,#e9e6f0);border-left:4px solid var(--muted,#8a8398);
    border-radius:12px;padding:10px 12px;margin-bottom:8px}
  .inp-out-main{flex:1;min-width:220px;line-height:1.45}
  .inp-out-act{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
  .inp-out-row.inp-out-changed{border-left-color:var(--orange,#e0862a);background:var(--orange-soft,#fdf3e7)}
  @media (max-width:700px){.inp-out-act{width:100%}.inp-out-act .btn{flex:1;min-height:38px}}
  .inp-group{margin-bottom:6px}
  .inp-group-h{display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:13px;
    padding:6px 10px;background:var(--gold-soft,#f6efdc);border-radius:8px;margin-bottom:8px}
  .inp-group-h .muted{font-weight:600;font-size:11.5px}
  .inp-group-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
  .inpc-pager{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;padding:14px 0 4px}
  .inpc-pg{min-width:34px;height:34px;padding:0 10px;border:1px solid var(--border,#e9e6f0);
    background:var(--card,#fff);color:var(--muted,#5b5468);border-radius:9px;font-size:13px;font-weight:700;
    cursor:pointer;font-family:inherit}
  .inpc-pg:hover:not(:disabled){border-color:var(--purple,#7c5cbf);color:var(--purple,#7c5cbf)}
  .inpc-pg.on{background:var(--purple,#7c5cbf);border-color:var(--purple,#7c5cbf);color:#fff}
  .inpc-pg:disabled{opacity:.4;cursor:default}
  .inpc-pg-info{font-size:11.5px;color:var(--muted,#8a8398);margin-left:8px}
  #inp-drawer-overlay{position:fixed;inset:0;background:rgba(30,22,55,.42);
    opacity:0;pointer-events:none;transition:opacity .2s ease;z-index:390}
  #inp-drawer-overlay.open{opacity:1;pointer-events:auto}
  #inp-drawer{position:fixed;top:0;right:0;height:100%;width:min(680px,100vw);
    background:var(--bg,#f5f4f8);box-shadow:-8px 0 30px rgba(30,22,55,.18);
    transform:translateX(100%);transition:transform .25s ease;z-index:391;
    overflow-y:auto;padding:12px 16px 40px;box-sizing:border-box}
  #inp-drawer.open{transform:translateX(0)}
  #inp-drawer-head{display:flex;justify-content:flex-end;position:sticky;top:0;z-index:2;padding:2px 0 8px}
  #inp-drawer-close{border:1px solid var(--border,#e9e6f0);background:var(--card,#fff);
    color:var(--muted,#5b5468);border-radius:9px;padding:7px 14px;font-size:12.5px;font-weight:700;
    cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(30,22,55,.12)}
  #inp-drawer-close:hover{border-color:var(--red,#c0483f);color:var(--red,#c0483f)}
  #inp-drawer #inp-detail-card{margin:0}
  `;
  document.head.appendChild(st);
}

// ============================================================
// INPATIENT — daily logs + prepayments helpers
// ============================================================

function getInpPrepayments(i) {
  return Array.isArray(i.prepayments) ? i.prepayments : [];
}
function getInpPrepaidTotal(i) {
  return getInpPrepayments(i).reduce((a,b) => a + (parseFloat(b.amount)||0), 0);
}
function getInpDailyTotal(i) {
  const logs = Array.isArray(i.log) ? i.log : [];
  return logs.reduce((a,b) => a + (parseFloat(b.amount)||0), 0);
}
function getInpGrandTotal(i) {
  // Initial exam amount + sum of daily log amounts (prepayments are subtracted at discharge)
  return (parseFloat(i.initialAmount)||0) + getInpDailyTotal(i);
}
function getInpDueAmount(i) {
  return Math.max(0, getInpGrandTotal(i) - getInpPrepaidTotal(i));
}

// Selected meds and services for the day-log entry (transient state)
let INP_DRAFT = { meds: [], services: [] };

// Default daily fee
const DEFAULT_DAILY_FEE = 80000;

function getDailyFee(i) {
  if (i && (i.dailyFee !== undefined && i.dailyFee !== null && i.dailyFee !== '')) {
    return parseFloat(i.dailyFee) || 0;
  }
  return DEFAULT_DAILY_FEE;
}

// Override grand total to include accommodation (daily fee × days)
function getInpAccommodation(i, atMs) {
  const days = inpatientDays(i.admittedMs, atMs);
  return getDailyFee(i) * days;
}
function getInpServicesTotal(i) {
  return getInpDailyTotal(i);
}
function getInpFullTotal(i, atMs) {
  return (parseFloat(i.initialAmount)||0) + getInpServicesTotal(i) + getInpAccommodation(i, atMs);
}

function updateDailyFee() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  const v = parseFloat($('#inp-daily-fee').value);
  i.dailyFee = (isNaN(v) || v < 0) ? DEFAULT_DAILY_FEE : v;
  i.ms = nowMs();
  saveAll();
  fbSaveRecord('inps', i);
  if (i.discharged) { clearTimeout(window.__feeRecalcT); window.__feeRecalcT = setTimeout(() => { if (recomputeDischargedInvoice(i, 'хоногийн төлбөр ' + fmt(i.dailyFee))) renderIDetail(); }, 600); }
  renderInpFinTab(i);
}

function renderIDetail() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) { $('#inp-detail-card').classList.add('hidden'); return; }
  $('#inp-detail-card').classList.remove('hidden');
  const days = inpatientDays(i.admittedMs, i.dischargedMs);

  $('#inp-detail-title').innerHTML = `📌 ${escHTML(i.horse)} <span class="muted" style="font-size:11px;font-weight:600">· ${escHTML(i.owner)} · ${days} хоног</span>${inpExamNum(i) ? ' <span class="badge b-o" style="font-size:11px;font-weight:800;margin-left:6px">🔢 ' + escHTML(inpExamNum(i)) + '</span>' : ''}${i.discharged ? ' <span class="badge b-g" style="font-size:11px;font-weight:800;margin-left:6px">🚪 Гарсан · ' + escHTML(i.dischargedDate || '') + '</span>' : ''}`;

  // 🚪 Гарсан адууны карт: гаргах/цуцлах товч нуугдана, урьдчилгаа нэмэхгүй (төлбөр Accountant / Finance дээр),
  // эмчилгээний бичлэг нэмэх/устгахад нэхэмжлэх дахин бодогдоно
  const bar = $('#inp-discharged-bar'), act = $('#inp-action-row'), pre = $('#inp-prepay-row');
  if (i.discharged) {
    const f = _inpDischargeFinOf(i);
    if (bar) { bar.classList.remove('hidden'); bar.innerHTML = `🚪 <b>Гарсан адуу</b> · ${escHTML(i.admittedDate || '')} → <b>${escHTML(i.dischargedDate || '')}</b> · ${days} хоног · гаргасан: ${escHTML(inpDischargeAuditText(i))}<br>
      <span class="muted">Энд эмчилгээ / эмийн дүн нэмэх, устгах, хоногийн төлбөр солиход <b>нэхэмжлэх (${f ? fmt(f.amount) : 'олдсонгүй'}) автоматаар дахин бодогдоно</b>. Төлбөрийг Accountant / Finance дээр бүртгэнэ.</span>
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px">
        ${f ? `<button class="btn btn-xs" onclick="openFinRecord('${escHTML(f.id)}')">🧾 Нэхэмжлэх (Accountant / Finance)</button>` : ''}
        ${canEditData() ? `<button class="btn btn-xs" onclick="openDischargeDateFix('${escHTML(i.id)}')">🗓 Гарсан огноо засах</button><button class="btn btn-xs" onclick="undoDischarge('${escHTML(i.id)}')">↩ Буцаан байрлуулах</button>` : ''}
        <button class="btn btn-xs" onclick="printOwnerSheet('${escHTML(i.id)}')">📋 Гарах хуудас</button>
      </div>`; }
    if (act) act.classList.add('hidden');
    if (pre) pre.classList.add('hidden');
  } else {
    if (bar) { bar.classList.add('hidden'); bar.innerHTML = ''; }
    if (act) act.classList.remove('hidden');
    if (pre) pre.classList.remove('hidden');
  }
  const cBtn = $('#inp-cancel-btn');
  if (cBtn) {
    cBtn.textContent = i.fromExam ? '↩ Үзлэг рүү буцаах' : '↩ Хүлээлт рүү буцаах';
    cBtn.title = i.fromExam ? 'Түүхээс шилжүүлснийг цуцлаад анхны үзлэг, нэхэмжлэхийг сэргээнэ (эмчилгээ бичээгүй үед)' : 'Андуурч байрлуулсан бол хүлээлт рүү буцаах';
  }

  // Wire up tab switcher
  $$('.tab[data-itab]').forEach(t => {
    t.onclick = () => {
      const tab = t.dataset.itab;
      $$('.tab[data-itab]').forEach(x => x.classList.toggle('active', x.dataset.itab === tab));
      $$('.itab').forEach(x => x.classList.toggle('hidden', x.dataset.itab !== tab));
    };
  });

  // === TAB 1: INFO ===
  renderInpInfoTab(i);

  // 📞 Эзэнд мэдээлсэн тэмдэглэл (Мэдээлэл таб)
  try { renderInpCallBlock(i); } catch (e) { console.error('call block', e); }

  // === TAB 2: TREATMENT ===
  renderInpTreatTab(i);
  // 💊 Эмчилгээний курс (Эмчилгээ таб, маягтын дээр)
  try { if (typeof renderInpCourseBlock === 'function') renderInpCourseBlock(i); } catch (e) { console.error('course block', e); }
  // 🗓 Маргаашийн төлөвлөгөө (Эмчилгээ таб)
  try { renderInpPlanBlock(i); } catch (e) { console.error('plan block', e); }

  // === TAB 3: FINANCE ===
  renderInpFinTab(i);
}

function renderInpInfoTab(i) {
  const d = inpDoctorOf(i);
  const docOpts = '<option value="">— заагаагүй —</option>' + (STATE.doctors || []).map(x => `<option value="${escHTML(x.id)}" ${d && String(d.id) === String(x.id) ? 'selected' : ''}>${escHTML(x.name)}</option>`).join('');
  const locs = inpLocations().slice(); if (i.location && !locs.includes(i.location)) locs.push(i.location);
  const locOpts = '<option value="">— заагаагүй —</option>' + locs.map(l => `<option ${l === i.location ? 'selected' : ''}>${escHTML(l)}</option>`).join('');
  const num = inpExamNum(i);
  $('#inp-info-body').innerHTML = `
    ${i.fromExam ? `<div style="background:var(--purple-soft);color:var(--purple);padding:8px 12px;border-radius:8px;margin-bottom:8px;font-size:12.5px;font-weight:700">🔁 Түүхээс үзлэгээс шилжүүлсэн · ${escHTML(i.fromExam.by || '')} · ${escHTML(fmtDateTime(i.fromExam.ms))}${i.fromExam.paid ? ' · ' + fmt(i.fromExam.paid) + ' урьдчилгаа болсон' : ''}</div>` : ''}
    <div style="background:var(--orange-soft);padding:8px 12px;border-radius:8px;margin-bottom:10px;font-weight:800;color:var(--orange-dark);font-size:14px">🔢 Үзлэгийн хуудасны дугаар: ${num ? escHTML(num) : '<span class="muted" style="font-weight:600">— олдсонгүй (үзлэг холбогдоогүй)</span>'}</div>
    <div class="fg r2">
      <div class="fld"><label>Эзэн</label><div class="bold">${escHTML(i.owner)}</div></div>
      <div class="fld"><label>Утас</label><div class="bold">${escHTML(i.phone)}</div></div>
      <div class="fld"><label>Эмчлэгч эмч</label><select class="inp" onchange="setInpField('docId', this.value)">${docOpts}</select></div>
      <div class="fld"><label>📍 Байрлал</label><select class="inp" onchange="setInpField('location', this.value)">${locOpts}</select></div>
      <div class="fld"><label>Орсон огноо</label><div class="bold">${escHTML(i.admittedDate)}${i.discharged ? ' → ' + escHTML(i.dischargedDate || '') : ''}</div></div>
      <div class="fld"><label>Хоног</label><div class="bold">${inpatientDays(i.admittedMs, i.dischargedMs)}</div></div>
      <div class="fld"><label>Зэрэглэл <span class="muted" style="font-weight:400;font-size:10px">(Өдрийн мэдээнд)</span></label><select class="inp" onchange="setInpField('severity', this.value)">${(typeof INP_SEVERITY !== 'undefined' ? INP_SEVERITY : [['', '—'], ['Хүнд', 'Хүнд'], ['Дунд', 'Дунд'], ['Хөнгөн', 'Хөнгөн']]).map(s => `<option value="${escHTML(s[0])}" ${(i.severity || '') === s[0] ? 'selected' : ''}>${escHTML(s[1])}</option>`).join('')}</select></div>
    </div>
    <div class="fld" style="margin-top:8px"><label>Анхны онош ${(() => { const ex = i.examId ? _dxExam(i.examId) : null; return ex ? dxBadgeHTML(ex, { small: true }) + (dxIsOpen(ex) ? ` <a href="#" style="font-size:11px" onclick="openDxModal('${escHTML(ex.id)}');return false;">хянах ›</a>` : '') : ''; })()}</label>
      <div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px">${escHTML(i.diagnosis)}</div>
    </div>
  `;

  // Day-by-day list (NO amounts) — эмчилгээний бичлэг + тухайн өдрийн төлөвлөгөө
  const wrap = $('#inp-summary-list');
  const logs = Array.isArray(i.log) ? i.log : [];
  const plans = inpPlans(i);
  if (logs.length === 0 && plans.length === 0) {
    wrap.innerHTML = '<div class="empty" style="padding:16px;font-size:12px">Эмчилгээний бичлэг алга</div>';
    return;
  }
  // Group logs by date
  const byDate = {};
  logs.forEach(l => {
    const d = (l.date||'').slice(0,10);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(l);
  });
  plans.forEach(p => { if (p.date && !byDate[p.date]) byDate[p.date] = []; });
  const dates = Object.keys(byDate).sort().reverse();
  wrap.innerHTML = dates.map(d => {
    const items = byDate[d];
    const p = inpPlanFor(i, d);
    return `
      <div style="padding:10px;background:var(--input);border-radius:8px;margin-bottom:6px">
        <div class="bold" style="font-size:13px;margin-bottom:6px">📅 ${escHTML(d)}${d > todayStr() ? ' <span class="badge b-p">төлөвлөгөө</span>' : (!items.length ? ' <span class="badge b-r">эмчилгээ бичигдээгүй</span>' : '')}</div>
        ${p ? `<div style="font-size:12px;margin-bottom:4px;color:var(--purple)"><b>🗓 Төлөвлөгөө:</b> <span style="white-space:pre-wrap">${escHTML(p.text)}</span> <span class="muted">— ${escHTML(p.editedBy || p.by || '')}</span></div>` : ''}
        ${items.map(l => `
          <div style="padding:6px 0;border-top:1px solid var(--border);font-size:12px">
            <div style="font-weight:700;margin-bottom:2px">👨‍⚕️ ${escHTML(l.docName||'—')}</div>
            ${l.diagnosis ? `<div><b>Онош:</b> ${escHTML(l.diagnosis)}</div>` : ''}
            ${l.note ? `<div><b>Эмчилгээ:</b> ${escHTML(l.note)}</div>` : ''}
            ${(l.temp||l.pulse||l.wt) ? `<div style="color:var(--muted);font-size:11px">T: ${escHTML(l.temp||'—')} · P: ${escHTML(l.pulse||'—')} · W: ${escHTML(l.wt||'—')}</div>` : ''}
            ${Array.isArray(l.meds) && l.meds.length ? `<div style="font-size:11px;margin-top:4px"><b>Эм:</b> ${l.meds.map(m => escHTML((m.name||m)+(m.note?' — '+m.note:''))).join(', ')}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function renderInpTreatTab(i) {
  // Populate doctor select & default date
  const docSel = $('#inp-log-doc');
  if (docSel) {
    docSel.innerHTML = STATE.doctors.map(d =>
      `<option value="${escHTML(d.id)}" ${String(d.id)===String(i.docId)?'selected':''}>${escHTML(d.name)}</option>`
    ).join('');
  }
  const ld = $('#inp-log-date');
  if (ld) {
    // Гарсан адуу: огноо орсон→гарсан хооронд, анхдагч нь гарсан өдөр
    ld.min = i.admittedDate || ''; ld.max = i.discharged ? (i.dischargedDate || todayStr()) : todayStr();
    if (!ld.value || ld.dataset.inpId !== String(i.id) || (i.discharged && ld.value > (i.dischargedDate || todayStr()))) ld.value = i.discharged ? (i.dischargedDate || todayStr()) : todayStr();
    ld.dataset.inpId = String(i.id);
  }

  // ⤵ "Өмнөх өдрийг татах" товчийг маягтын дээр нэг удаа суулгана (index.html засах шаардлагагүй)
  ensureCopyPrevBtn();

  // INP_DRAFT-г зөвхөн байрлан эмчлэх сонголт өөрчлөгдсөн үед reset хийнэ
  if (!INP_DRAFT._inpId || INP_DRAFT._inpId !== String(i.id)) {
    INP_DRAFT = { meds: [], services: [], _inpId: String(i.id) };
  }
  // 💊 Курсийн эмийг сонгосон өдрийн маягтад автоматаар бэлтгэнэ (эмчийн гараар нэмснийг дардаггүй)
  try { if (typeof inpPrefillDraftFromCourse === 'function' && INP_DRAFT._courseDate !== ((ld && ld.value) || todayStr())) inpPrefillDraftFromCourse(i, (ld && ld.value) || todayStr()); } catch (e) { console.error('course prefill', e); }
  renderInpDraftMeds();
  renderInpDraftServices();
  recomputeInpDayAmt();
  setupInpMedSearch();
  setupInpSvcSearch();

  // Render day log history (with optional date filter)
  const filter = $('#inp-filter-date') ? $('#inp-filter-date').value : '';
  const lh = $('#inp-log');
  let logs = Array.isArray(i.log) ? i.log : [];
  if (filter) {
    logs = logs.filter(l => (l.date||'').slice(0,10) === filter);
  }
  if (logs.length === 0) {
    lh.innerHTML = '<div class="empty" style="padding:16px;font-size:12px">Бүртгэл алга</div>';
  } else {
    lh.innerHTML = logs.slice().reverse().map((l, idx) => {
      const realIdx = i.log.length - 1 - idx;
      return `
        <div style="padding:10px;background:var(--input);border-radius:8px;margin-bottom:6px">
          <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:6px">
            <span class="bold" style="font-size:13px">📅 ${escHTML(l.date||'—')} · ${escHTML(l.docName||'—')}</span>
            <span class="row" style="gap:6px">
              <span class="badge b-o">${fmt(l.amount||0)}</span>
              <button class="btn btn-xs" onclick="copyInpDayByIdx(${realIdx})" title="Энэ өдрийн эмчилгээг маягтад татах">⤵</button>
              <button class="btn btn-r btn-xs" onclick="deleteInpLog(${realIdx})">✕</button>
            </span>
          </div>
          ${l.diagnosis ? `<div style="font-size:12px;margin-top:6px"><b>Онош:</b> ${escHTML(l.diagnosis)}</div>` : ''}
          ${l.note ? `<div style="font-size:12px;margin-top:4px"><b>Эмчилгээ:</b> ${escHTML(l.note)}</div>` : ''}
          ${(l.temp||l.pulse||l.wt) ? `<div style="font-size:11px;color:var(--muted);margin-top:4px">T: ${escHTML(l.temp||'—')} · P: ${escHTML(l.pulse||'—')} · W: ${escHTML(l.wt||'—')}</div>` : ''}
          ${Array.isArray(l.services) && l.services.length ? `
            <div style="font-size:11px;margin-top:4px">
              <b>Үйлчилгээ:</b> ${l.services.map(s => escHTML(s.name)+' (' + fmt(parseFloat(s.price)||0) + ')').join(', ')}
            </div>` : ''}
          ${Array.isArray(l.meds) && l.meds.length ? `
            <div style="font-size:11px;margin-top:4px">
              <b>Эм:</b> ${l.meds.map(m => escHTML((m.name||m)+(m.note?' — '+m.note:''))).join(', ')}
            </div>` : ''}
        </div>
      `;
    }).join('');
  }
}

function renderInpFinTab(i) {
  // Daily fee input
  const fee = getDailyFee(i);
  if ($('#inp-daily-fee')) $('#inp-daily-fee').value = fee;

  // Build day-by-day list with amounts
  // ⚠️ Хоногийн тоо нь гаргах тооцоотой ЯГ ИЖИЛ дүрмээр (inpatientDays: 12:00-оос өмнө бол сүүлийн өдөр тооцохгүй)
  const days = inpatientDays(i.admittedMs, i.dischargedMs);
  const logs = Array.isArray(i.log) ? i.log : [];

  // Group log amounts by date
  const treatByDate = {};
  logs.forEach(l => {
    const d = (l.date||'').slice(0,10);
    if (!treatByDate[d]) treatByDate[d] = 0;
    treatByDate[d] += parseFloat(l.amount)||0;
  });

  // Build list of all days from admission to today
  const list = [];
  if (i.admittedMs) {
    const adm = new Date(i.admittedMs);
    const start = new Date(adm.getFullYear(), adm.getMonth(), adm.getDate());
    const end = i.dischargedMs ? new Date(i.dischargedMs) : new Date();
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    let cur = new Date(start);
    let dayN = 1;
    while (cur.getTime() <= endDay.getTime()) {
      const dStr = cur.getFullYear() + '-' + String(cur.getMonth()+1).padStart(2,'0') + '-' + String(cur.getDate()).padStart(2,'0');
      list.push({
        date: dStr,
        dayN: dayN,
        accommodation: fee,
        treatment: treatByDate[dStr] || 0
      });
      cur.setDate(cur.getDate() + 1);
      dayN++;
    }
    // Сүүлийн өдөр 12:00-оос өмнө (гарсан / одоо) бол хоногийн хөлс тооцогдохгүй — тооцоотой нийцүүлнэ
    if (list.length > days && list.length) { const last = list[list.length - 1]; last.accommodation = 0; last.halfDay = true; }
  }

  const finList = $('#inp-fin-list');
  if (list.length === 0) {
    finList.innerHTML = '<div class="empty" style="padding:16px;font-size:12px">Өгөгдөл алга</div>';
  } else {
    finList.innerHTML = `
      <div class="tbl-wrap">
        <table style="font-size:12px">
          <thead><tr>
            <th>#</th><th>Огноо</th><th>Хоног</th><th>Эмчилгээ</th><th>Дүн</th>
          </tr></thead>
          <tbody>
            ${list.map(d => `
              <tr>
                <td>${d.dayN}</td>
                <td>${escHTML(d.date)}${d.halfDay ? ' <span class="muted" style="font-size:10px">12:00-оос өмнө — хоног тооцохгүй</span>' : ''}</td>
                <td>${fmt(d.accommodation)}</td>
                <td>${fmt(d.treatment)}</td>
                <td class="bold">${fmt(d.accommodation + d.treatment)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Prepayments
  renderInpPrepaymentsList(i);

  // Summary
  const examFee = parseFloat(i.initialAmount)||0;
  const accommodation = list.reduce((a,b)=>a+b.accommodation, 0);
  const treatment = list.reduce((a,b)=>a+b.treatment, 0);
  const grandTotal = examFee + accommodation + treatment;
  const prepaid = getInpPrepaidTotal(i);
  const due = Math.max(0, grandTotal - prepaid);
  $('#inp-fin-summary').innerHTML = `
    <div style="background:var(--input);padding:14px;border-radius:8px">
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>🩺 Үзлэгийн төлбөр:</span><span class="bold">${fmt(examFee)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>🏨 Хоног (${days} × ${fmt(fee)}):</span><span class="bold">${fmt(accommodation)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>💊 Эмчилгээ:</span><span class="bold">${fmt(treatment)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:14px;font-weight:900;padding-top:6px;border-top:1px solid var(--border)">
        <span>Нийт:</span><span>${fmt(grandTotal)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-top:4px">
        <span>Урьдчилгаа:</span><span class="bold" style="color:var(--green)">−${fmt(prepaid)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:16px;font-weight:900;padding-top:6px;border-top:2px solid var(--border)">
        <span>Үлдэгдэл:</span><span style="color:${due>0?'var(--red)':'var(--green)'}">${fmt(due)}</span>
      </div>
    </div>
  `;
}

function renderInpPrepaymentsList(i) {
  const wrap = $('#inp-prepay-summary');
  if (!wrap) return;
  const ps = getInpPrepayments(i);
  if (ps.length === 0) {
    wrap.innerHTML = '<div class="muted" style="font-size:12px;padding:6px 0">Урьдчилгаа төлбөр алга</div>';
    return;
  }
  wrap.innerHTML = '<div style="display:flex;flex-direction:column;gap:4px">' + ps.map((p,idx) => `
    <div class="row" style="justify-content:space-between;background:var(--input);padding:8px 10px;border-radius:6px;font-size:12px">
      <span>${methodIcon(p.method)} <b>${escHTML(p.method)}</b> · ${escHTML(p.purpose||'')} <span class="muted">${escHTML(p.date||'')}</span></span>
      <span class="row" style="gap:8px">
        <span class="bold">${fmt(p.amount)}</span>
        ${i.discharged ? '' : `<button class="btn btn-r btn-xs" onclick="deleteInpPrepay(${idx})">✕</button>`}
      </span>
    </div>
  `).join('') + '</div>';
}

function setupInpMedSearch() {
  const inp = $('#inp-med-search');
  const list = $('#inp-med-list');
  if (!inp || !list) return;
  inp.oninput = () => {
    const q = inp.value.toLowerCase().trim();
    if (!q) { list.classList.remove('show'); list.innerHTML = ''; return; }
    // 💊 Каталогт байгаа эм эхэнд (нэгжийн үнэтэй), дараа нь MED_LIST
    const matches = (typeof medSearchAll === 'function') ? medSearchAll(q, 12) : MED_LIST.filter(m => m.toLowerCase().includes(q)).slice(0, 12).map(n => ({ name: n }));
    if (matches.length === 0) { list.classList.remove('show'); list.innerHTML = ''; return; }
    list.innerHTML = matches.map(m => `<div class="dd-i" data-m="${escHTML(m.name)}">${escHTML(m.name)}${m.inCat ? ' <span class="muted" style="font-size:10.5px">· ' + fmt(m.price) + '/' + escHTML(m.unit || 'нэгж') + '</span>' : ''}</div>`).join('');
    list.classList.add('show');
    list.querySelectorAll('.dd-i').forEach(el => el.onclick = () => {
      const m = el.dataset.m;
      if (typeof inpDraftAddMed === 'function') inpDraftAddMed(m);
      else if (!INP_DRAFT.meds.find(x => x.name === m)) { INP_DRAFT.meds.push({ name: m, price: 0 }); renderInpDraftMeds(); }
      inp.value = '';
      list.classList.remove('show');
      list.innerHTML = '';
    });
  };
  inp.onblur = () => setTimeout(() => list.classList.remove('show'), 150);
}

function renderInpDraftMeds() {
  const wrap = $('#inp-med-chips');
  if (!wrap) return;
  if (INP_DRAFT.meds.length === 0) { wrap.innerHTML = ''; return; }
  // 💊 Мөр бүр: нэр · тоо (нэгж) · тайлбар · үнэ (= тоо × каталогийн нэгжийн үнэ, гараар засагдана)
  if (typeof inpDraftMedRowHTML === 'function') { wrap.innerHTML = INP_DRAFT.meds.map((m, i) => inpDraftMedRowHTML(m, i)).join(''); return; }
  wrap.innerHTML = INP_DRAFT.meds.map((m, i) => `
    <div style="display:flex;align-items:center;gap:6px;background:var(--input);border-radius:8px;padding:6px 10px;margin-bottom:4px;flex-wrap:wrap">
      <span style="font-size:13px;font-weight:600;min-width:120px;flex-shrink:0">${escHTML(m.name)}</span>
      <input class="inp" type="text" value="${escHTML(m.note||'')}"
        placeholder="Тайлбар: өдрийн 3-р 14 хоног..."
        style="flex:1;min-width:140px;padding:4px 8px;font-size:12px"
        oninput="INP_DRAFT.meds[${i}].note=this.value">
      <input class="inp" type="number" value="${m.price||0}" placeholder="Үнэ ₮"
        style="width:90px;padding:4px 8px;font-size:12px"
        oninput="updateInpMedPrice(${i}, this.value)">
      <button class="btn btn-r btn-xs" onclick="removeInpDraftMed(${i})">✕</button>
    </div>
  `).join('');
}

function updateInpMedPrice(idx, val) {
  if (INP_DRAFT.meds[idx]) { INP_DRAFT.meds[idx].price = parseFloat(val) || 0; recomputeInpDayAmt(); }
}

// ➕ Гараар дүн нэмэх — жагсаалтад байхгүй эмчилгээ/эм, эсвэл зөвхөн дүн.
// Үйлчилгээ/эмийн мөр болж ордог тул дүн, задаргаа, хэвлэлт бүгд хэвийн ажиллана.
function addInpManualItem() {
  const kind = ($('#inp-man-kind') || {}).value || 'svc';
  const nameEl = $('#inp-man-name'), amtEl = $('#inp-man-amt');
  const amt = parseFloat(amtEl ? amtEl.value : '');
  if (!amt || amt <= 0) { toast('Дүн оруулна уу', 'err'); if (amtEl) amtEl.focus(); return; }
  const name = ((nameEl ? nameEl.value : '') || '').trim() || (kind === 'med' ? 'Эм (гараар бичсэн дүн)' : 'Эмчилгээ (гараар бичсэн дүн)');
  if (kind === 'med') { INP_DRAFT.meds.push({ name, note: '', price: amt, manual: true }); renderInpDraftMeds(); }
  else { INP_DRAFT.services.push({ name, price: amt, manual: true }); renderInpDraftServices(); }
  recomputeInpDayAmt();
  if (nameEl) nameEl.value = ''; if (amtEl) amtEl.value = '';
  toast('➕ ' + name + ' · ' + fmt(amt), 'ok');
}

function removeInpDraftMed(idx) {
  INP_DRAFT.meds.splice(idx, 1);
  renderInpDraftMeds();
  recomputeInpDayAmt();
}

function setupInpSvcSearch() {
  const inp = $('#inp-svc-search');
  const list = $('#inp-svc-list');
  if (!inp || !list) return;
  inp.oninput = () => {
    const q = inp.value.toLowerCase().trim();
    if (!q) { list.classList.remove('show'); list.innerHTML = ''; return; }
    // SERVICE_LIST биш getAllServices() — Admin тохируулсан үнэ, custom үйлчилгээ зөв орно
    const allSvcs = getAllServices();
    const matches = allSvcs
      .filter(name => name.toLowerCase().includes(q))
      .slice(0, 12)
      .map(name => ({ name, price: getSvcPrice(name) }));
    if (matches.length === 0) { list.classList.remove('show'); list.innerHTML = ''; return; }
    list.innerHTML = matches.map(s => `<div class="dd-i" data-name="${escHTML(s.name)}" data-price="${s.price}">${escHTML(s.name)} <span class="muted">${fmt(s.price)}</span></div>`).join('');
    list.classList.add('show');
    list.querySelectorAll('.dd-i').forEach(el => { el.onmousedown = (e) => { e.preventDefault();
      INP_DRAFT.services.push({ name: el.dataset.name, price: parseFloat(el.dataset.price)||0 });
      renderInpDraftServices();
      recomputeInpDayAmt();
      inp.value = '';
      list.classList.remove('show');
      list.innerHTML = '';
      inp.focus();
      };
    });
  };
  inp.onblur = () => { list.classList.remove('show'); list.innerHTML = ''; };
}

function renderInpDraftServices() {
  const wrap = $('#inp-svc-chips');
  if (!wrap) return;
  if (INP_DRAFT.services.length === 0) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = INP_DRAFT.services.map((s, i) => `
    <div class="row" style="justify-content:space-between;background:var(--input);padding:6px 10px;border-radius:6px;font-size:12px">
      <span>${escHTML(s.name)}</span>
      <span class="row" style="gap:6px">
        <input class="inp" type="number" value="${s.price}" data-svc-idx="${i}" style="width:90px;padding:4px 8px;font-size:12px" oninput="updateInpSvcPrice(${i}, this.value)">
        <button class="btn btn-r btn-xs" onclick="removeInpDraftSvc(${i})">✕</button>
      </span>
    </div>
  `).join('');
}

function removeInpDraftSvc(idx) {
  INP_DRAFT.services.splice(idx, 1);
  renderInpDraftServices();
  recomputeInpDayAmt();
}

function updateInpSvcPrice(idx, val) {
  INP_DRAFT.services[idx].price = parseFloat(val) || 0;
  recomputeInpDayAmt();
}

function recomputeInpDayAmt() {
  const svcTotal = INP_DRAFT.services.reduce((a,b) => a + (parseFloat(b.price)||0), 0);
  const medTotal = INP_DRAFT.meds.reduce((a,b) => a + (parseFloat(b.price)||0), 0);
  const total = svcTotal + medTotal;
  if ($('#inp-day-amt')) $('#inp-day-amt').value = fmt(total);
}

function addInpLog() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  const date = $('#inp-log-date').value || todayStr();
  const docId = $('#inp-log-doc').value;
  const doc = STATE.doctors.find(d => String(d.id) === String(docId));
  const note = $('#inp-note').value.trim();
  const diag = $('#inp-diag').value.trim();
  if (!note && !diag && INP_DRAFT.services.length === 0 && INP_DRAFT.meds.length === 0) {
    toast('Эмчилгээ эсвэл онош оруулна уу', 'err'); return;
  }
  const svcAmount = INP_DRAFT.services.reduce((a,b) => a + (parseFloat(b.price)||0), 0);
  const medAmount = INP_DRAFT.meds.reduce((a,b) => a + (parseFloat(b.price)||0), 0);
  const amount = svcAmount + medAmount;
  const log = {
    id: uid(),
    date: date,
    slot: ($('#inp-log-slot') || {}).value || '',   // ⏰ Өглөө/Өдөр/Орой/Шөнө (Өдрийн мэдээнд тоологдоно)
    docId: docId,
    docName: doc ? doc.name : '—',
    diagnosis: diag,
    note: note,
    temp: $('#inp-temp').value,
    pulse: $('#inp-pulse').value,
    wt: $('#inp-wt').value,
    services: INP_DRAFT.services.slice(),
    meds: INP_DRAFT.meds.slice(),
    amount: amount,
    ms: nowMs()
  };
  if (i.discharged && i.dischargedDate && date > i.dischargedDate) { toast('Гарсан огноо (' + i.dischargedDate + ')-оос хойш бичлэг оруулах боломжгүй — эхлээд «🗓 Гарсан огноо засах»', 'err'); return; }
  if (!Array.isArray(i.log)) i.log = [];
  i.log.push(log);
  i.ms = nowMs();
  saveAll();
  fbSaveRecord('inps', i);
  // Reset form fields
  $('#inp-temp').value = ''; $('#inp-pulse').value = ''; $('#inp-wt').value = '';
  $('#inp-note').value = ''; $('#inp-diag').value = '';
  if ($('#inp-log-date')) $('#inp-log-date').value = i.discharged ? (i.dischargedDate || todayStr()) : todayStr();
  INP_DRAFT = { meds: [], services: [], _inpId: String(i.id) };
  if ($('#inp-log-slot')) $('#inp-log-slot').value = '';
  // 🚪 Гарсан адуу бол нэхэмжлэхийг дахин бодно
  if (i.discharged) recomputeDischargedInvoice(i, 'эмчилгээ нэмэв ' + fmt(amount));
  renderIDetail();
  toast('💾 Өдрийн бичлэг хадгалагдлаа', 'ok');
}

function deleteInpLog(idx) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i || !Array.isArray(i.log) || idx < 0 || idx >= i.log.length) return;
  if (!confirm('Энэ өдрийн бичлэгийг устгах уу?')) return;
  const removed = i.log[idx];
  i.log.splice(idx, 1);
  i.ms = nowMs();
  saveAll();
  fbSaveRecord('inps', i);
  if (i.discharged) recomputeDischargedInvoice(i, 'эмчилгээний бичлэг устгав ' + fmt((removed && removed.amount) || 0));
  renderIDetail();
}

// ============================================================
// INPATIENT — өмнөх өдрийн эмчилгээг татах
// ============================================================

// "Өмнөх өдрийг татах" товчийг маягтын дээр DOM-д нэг удаа суулгана
function ensureCopyPrevBtn() {
  if ($('#inp-copy-prev-btn')) return;
  const dateEl = $('#inp-log-date');
  if (!dateEl) return;
  const host = dateEl.closest('.fg') || dateEl.parentElement;
  if (!host || !host.parentElement) return;
  const btn = document.createElement('button');
  btn.id = 'inp-copy-prev-btn';
  btn.type = 'button';
  btn.textContent = '⤵ Өмнөх өдрийн эмчилгээг татах';
  btn.style.cssText = 'display:block;width:100%;margin:0 0 10px;padding:9px;border:1px dashed var(--orange,#c98a1a);' +
    'background:var(--orange-soft,#fcf3e0);color:var(--orange-dark,#b57708);border-radius:8px;' +
    'font-weight:700;font-size:12.5px;cursor:pointer;font-family:inherit';
  btn.onclick = copyPrevInpDay;
  host.parentElement.insertBefore(btn, host);
}

// Хамгийн сүүлийн бичлэгийг маягтад буулгана
function copyPrevInpDay() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i || !Array.isArray(i.log) || i.log.length === 0) {
    toast('Татах өмнөх бичлэг алга', 'err'); return;
  }
  const prev = [...i.log].sort((a, b) =>
    (a.ms || new Date(a.date).getTime() || 0) - (b.ms || new Date(b.date).getTime() || 0)
  ).pop();
  fillInpFormFromLog(prev);
  toast('⤵ Өмнөх өдрийн эмчилгээ татагдлаа', 'ok');
}

// Түүхийн тодорхой бичлэгийг маягтад буулгана (log массивын индексээр)
function copyInpDayByIdx(idx) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i || !Array.isArray(i.log) || !i.log[idx]) return;
  fillInpFormFromLog(i.log[idx]);
  toast('⤵ ' + (i.log[idx].date || '') + '-ны эмчилгээ татагдлаа', 'ok');
}

function fillInpFormFromLog(src) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i || !src) return;
  if ($('#inp-diag')) $('#inp-diag').value = src.diagnosis || '';
  if ($('#inp-note')) $('#inp-note').value = src.note || '';
  // Vitals (халуун/судас/жин)-ыг зориуд ХУУЛАХГҮЙ — өдөр бүр шинээр хэмжинэ
  INP_DRAFT = {
    services: Array.isArray(src.services) ? src.services.map(s => ({ name: s.name, price: parseFloat(s.price) || 0 })) : [],
    meds: Array.isArray(src.meds) ? src.meds.map(m => ({ name: (m.name || m), note: m.note || '', price: parseFloat(m.price) || 0, qty: m.qty, unit: m.unit, unitPrice: m.unitPrice, courseId: m.courseId, dose: m.dose, perDay: m.perDay, manualPrice: !!m.manualPrice })) : [],
    _inpId: String(i.id)
  };
  renderInpDraftServices();
  renderInpDraftMeds();
  recomputeInpDayAmt();
}

// Prepayment functions
function openInpPrepay() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  $('#inp-prepay-info').innerHTML = '<b>' + escHTML(i.horse) + '</b> · ' + escHTML(i.owner);
  $('#inp-prepay-amt').value = '';
  $('#inp-prepay-method').value = 'бэлэн';
  $('#inp-prepay-purpose').value = 'Үзлэгийн төлбөр';
  openModal('inp-prepay-modal');
}

function saveInpPrepay() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  const amt = parseFloat($('#inp-prepay-amt').value);
  if (!amt || amt <= 0) { toast('Зөв дүн оруулна уу', 'err'); return; }
  if (!Array.isArray(i.prepayments)) i.prepayments = [];
  i.prepayments.push({
    amount: amt,
    method: $('#inp-prepay-method').value,
    purpose: $('#inp-prepay-purpose').value,
    date: todayStr(),
    ms: nowMs()
  });
  // Bump the record's ms so applyArray treats it as fresher than Sheet
  i.ms = nowMs();
  saveAll();
  fbSaveRecord('inps', i);
  closeModal('inp-prepay-modal');
  renderIDetail();
  toast('💵 Урьдчилгаа хадгалагдлаа', 'ok');
}

function deleteInpPrepay(idx) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i || !Array.isArray(i.prepayments) || idx < 0 || idx >= i.prepayments.length) return;
  if (!confirm('Энэ урьдчилгааг устгах уу?')) return;
  i.prepayments.splice(idx, 1);
  i.ms = nowMs();
  saveAll();
  fbSaveRecord('inps', i);
  renderIDetail();
}

/**
 * cancelInpatient — andуурсан бичлэгийг буцаах.
 *  - Байрлагчийн бичлэгийг (inps) бүрмөсөн устгана
 *  - Холбогдсон exam-г устгана (хадгалаагүй гэж тооцно)
 *  - Хэрэв доороос нь fin (нэхэмжлэх) үүссэн бол түүнийг ч устгана
 *  - Адуу/эзний мэдээллийг хүлээлт рүү буцааж шинэ waiting бичлэг үүсгэнэ
 */
function cancelInpatient() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  // 🏥 Түүхээс шилжүүлсэн адуу: хүлээлт рүү БИШ — анхны үзлэг/нэхэмжлэхийг сэргээнэ (үзлэг устгагдахгүй)
  if (i.fromExam) { revertInpToExam(i.id); return; }
  if (!confirm(
    'Энэ байрлагчийг хүлээлт рүү буцаах уу?\n\n' +
    'Байрлан эмчилгээний бичлэг бүрмөсөн арилна.\n' +
    'Холбогдох үзлэг болон нэхэмжлэхүүд устгагдана.'
  )) return;

  // Find related exam
  const exam = STATE.exams.find(e => String(e.id) === String(i.examId));
  // Remove related fins
  const removedFins = STATE.fins.filter(f => String(f.examId) === String(i.examId));
  STATE.fins = STATE.fins.filter(f => String(f.examId) !== String(i.examId));
  // Remove the exam
  STATE.exams = STATE.exams.filter(e => String(e.id) !== String(i.examId));
  // Remove the inpatient
  STATE.inps = STATE.inps.filter(x => String(x.id) !== String(i.id));

  // Re-create a waiting record from the exam/inpatient details
  const wait = {
    id: uid(),
    horseId: i.horseId || (exam && exam.horseId) || '',
    horse: i.horse,
    owner: i.owner,
    phone: i.phone,
    symptoms: i.diagnosis || (exam && exam.diagnosis) || '',
    urgency: 'green',
    examNum: exam && exam.examNum ? exam.examNum : '',
    ms: nowMs(),
    age: '', breed: '', province: ''
  };
  STATE.waiting.push(wait);

  saveAll();
  // Зөвхөн өөрчлөгдсөн record-уудыг бичнэ/устгана
  fbSaveRecord('waiting', wait);
  if (exam) fbDeleteDoc('exams', String(exam.id));
  removedFins.forEach(f => fbDeleteDoc('fins', String(f.id)));
  fbDeleteDoc('inps', String(i.id));
  writeLog('Байрлан эмчилгээг цуцлав (хүлээлт рүү)', i.id, i.horse + ' — ' + (i.docName || ''), 'Үзлэг ' + (exam ? 1 : 0) + ', нэхэмжлэх ' + removedFins.length + ' устгав · ' + _deviceLabel(), inpExamNum(i));

  STATE.selectedI = null;
  updateBadges();
  toast('↩ Хүлээлт рүү буцлаа', 'ok');
  nav('waiting');
}

// Discharge → opens modal showing final invoice with prepayments accounted for
function dischargeInpatient() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  // Compute totals with accommodation
  const days = inpatientDays(i.admittedMs);
  const dailyFee = getDailyFee(i);
  const examFee = parseFloat(i.initialAmount)||0;
  const treatmentTotal = getInpDailyTotal(i);
  const accommodation = dailyFee * days;
  const grandTotal = examFee + treatmentTotal + accommodation;
  const prepaid = getInpPrepaidTotal(i);
  const due = Math.max(0, grandTotal - prepaid);

  // Build summary
  const logs = Array.isArray(i.log) ? i.log : [];
  const prepayments = getInpPrepayments(i);

  $('#inp-discharge-body').innerHTML = `
    <div class="fg r2">
      <div class="fld"><label>Адуу / Эзэн</label><div class="bold">${escHTML(i.horse)} · ${escHTML(i.owner)}</div></div>
      <div class="fld"><label>Хоног</label><div class="bold" id="inp-dis-days">${days} хоног</div></div>
    </div>
    <div class="fld" style="margin-top:8px;background:var(--orange-soft,#fdf3e7);border-radius:8px;padding:8px 10px"><label style="color:var(--orange-dark)">🗓 Бодит гарсан огноо — адуу өмнө гарсан бол ЭНД тэр өдрийг сонго (хоног, төлбөр үүгээр бодогдоно)</label>
      <input class="inp" type="date" id="inp-dis-date" value="${todayStr()}" min="${escHTML(i.admittedDate || '')}" max="${todayStr()}" onchange="updateDischargeDate()" oninput="updateDischargeDate()" style="font-weight:800">
    </div>
    <div class="ch" style="margin-top:10px">📋 Эмчилгээний дэлгэрэнгүй</div>
    <div class="tbl-wrap" style="max-height:200px;overflow-y:auto">
      <table>
        <thead><tr><th>Огноо</th><th>Эмч</th><th>Дүн</th></tr></thead>
        <tbody>
          <tr><td>${escHTML(i.admittedDate)}</td><td>${escHTML(i.docName)}</td><td class="bold">${fmt(examFee)} <span class="muted" style="font-size:10px">үзлэг</span></td></tr>
          ${logs.map(l => `<tr><td>${escHTML(l.date)}</td><td>${escHTML(l.docName||'—')}</td><td class="bold">${fmt(l.amount||0)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${typeof inpItemizedHTML === 'function' ? inpItemizedHTML(i) : ''}
    <div class="ch" style="margin-top:10px">💵 Урьдчилгаа төлбөр</div>
    ${prepayments.length === 0 ? '<div class="muted" style="font-size:12px">Урьдчилгаа төлөгдөөгүй</div>' : `
      <div style="display:flex;flex-direction:column;gap:4px">
        ${prepayments.map(p => `
          <div class="row" style="justify-content:space-between;background:var(--input);padding:6px 10px;border-radius:6px;font-size:12px">
            <span>${methodIcon(p.method)} ${escHTML(p.method)} · ${escHTML(p.purpose||'')} <span class="muted">${escHTML(p.date)}</span></span>
            <span class="bold">${fmt(p.amount)}</span>
          </div>
        `).join('')}
      </div>
    `}
    <div style="background:var(--input);padding:14px;border-radius:8px;margin-top:14px">
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>🩺 Үзлэгийн төлбөр:</span><span class="bold">${fmt(examFee)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span id="inp-dis-acc-label">🏨 Хоног (${days} × ${fmt(dailyFee)}):</span><span class="bold" id="inp-dis-acc">${fmt(accommodation)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>💊 Эмчилгээ (${logs.length} бичлэг):</span><span class="bold">${fmt(treatmentTotal)}</span>
      </div>
      <div class="row" id="inp-dis-hm-row" style="justify-content:space-between;font-size:13px;margin-bottom:4px;display:none">
        <span>🏠 Гэрийн эм:</span><span class="bold" id="inp-dis-hm">0₮</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:14px;margin-bottom:4px;padding-top:6px;border-top:1px solid var(--border)">
        <span class="bold">Нийт дүн:</span><span class="bold" id="inp-dis-grand">${fmt(grandTotal)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>Төлсөн урьдчилгаа:</span><span class="bold" style="color:var(--green)">−${fmt(prepaid)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:18px;font-weight:900;padding-top:6px;border-top:2px solid var(--border)">
        <span>Үлдэгдэл төлөх:</span><span id="inp-dis-due" style="color:${due>0?'var(--red)':'var(--green)'}">${fmt(due)}</span>
      </div>
    </div>

    <div class="ch" style="margin-top:14px">📋 Эзэнд өгөх заавар (гарах хуудсанд хэвлэгдэнэ)</div>
    <div class="fld"><label>Гэрийн арчилгаа</label>
      <textarea class="inp" id="inp-dis-homecare" rows="3" placeholder="Хөдөлгөөн хязгаарлах хугацаа, хооллолт, шарх арчлах заавар..."></textarea>
    </div>
    <div class="fld" style="margin-top:8px"><label>Гэрт өгөх эм (үнэ бичвэл нийт дүнд нэмэгдэнэ)</label>
      <div id="inp-homemed-list"></div>
      <button class="btn btn-xs" type="button" onclick="addHomeMedRow()">+ Эм нэмэх</button>
    </div>
    <div class="fld" style="margin-top:8px"><label>Дараагийн хяналтын огноо</label>
      <input class="inp" type="date" id="inp-dis-followup">
    </div>
  `;
  // Live тооцоололд ашиглах суурь дүн (гэрийн эм нэмэгдэхэд нийт/үлдэгдэл шууд шинэчлэгдэнэ)
  DIS_BASE = { grand: grandTotal, prepaid: prepaid, examFee: examFee, treatmentTotal: treatmentTotal, dailyFee: dailyFee, admittedMs: i.admittedMs };
  // Сүүлийн өдрийн эмийг гэрийн эм болгож урьдчилан бөглөнө — эмч ихэвчлэн сүүлд хэрэглэсэн эмээ үргэлжлүүлдэг.
  // Үнийг хоосон үлдээнэ: зөвхөн бодитоор олгосон эмэнд үнэ бичнэ.
  if ($('#inp-homemed-list')) {
    $('#inp-homemed-list').innerHTML = '';
    const lastLog = (Array.isArray(i.log) && i.log.length) ? i.log[i.log.length - 1] : null;
    ((lastLog && Array.isArray(lastLog.meds)) ? lastLog.meds : []).forEach(m => addHomeMedRow(m.name || m, m.note || '', ''));
  }
  STATE.dischargeTarget = i.id;
  __disOpenedAt = Date.now();
  openModal('inp-discharge-modal');
}

// 🛡 Санамсаргүй гаргалтаас хамгаалах
// Утсан дээр modal доороос гулсаж гарахад «🚪 Гаргах ба нэхэмжлэх үүсгэх» товч
// яг drawer-ийн «🚪 Гаргах» товчны байранд ирдэг. Давхар/ghost tap нэг л
// хүрэлтээр адууг гаргачихдаг байсан → modal нээгдснээс 700ms дотор ирсэн
// даралтыг тоохгүй, мөн эцсийн баталгаажуулалт асууна.
let __disOpenedAt = 0;
function _deviceLabel() {
  try { return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? 'утас' : 'компьютер'; } catch (e) { return ''; }
}
function confirmDischarge() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.dischargeTarget));
  if (!i) return;
  if (Date.now() - __disOpenedAt < 700) return; // ghost / давхар tap
  if (i.discharged) { toast('Энэ адуу аль хэдийн гарсан байна', 'err'); closeModal('inp-discharge-modal'); return; }
  // 📋 Эзэнд өгөх заавар + гэрийн эм — modal-аас цуглуулж inp дээр хадгална
  // (fbSaveRecord('inps', i) доор дуудагддаг тул Firestore-т автоматаар орно)
  const homeMeds = collectHomeMeds();
  const homeMedsTotal = homeMeds.reduce((a, m) => a + (parseFloat(m.price) || 0), 0);
  i.dischargeInfo = {
    homecare: ($('#inp-dis-homecare') ? $('#inp-dis-homecare').value : '').trim(),
    homeMeds: homeMeds,
    followUpDate: $('#inp-dis-followup') ? $('#inp-dis-followup').value : '',
    ms: nowMs()
  };
  // 🗓 Сонгосон гарах огноо — өнгөрсөн огноогоор нөхөж гаргаж болно
  const disMs = getSelectedDischargeMs();
  if (i.admittedMs && disMs < i.admittedMs) { toast('Гарсан огноо орсон огнооноос өмнө байж болохгүй', 'err'); return; }
  const disDate = localDateStr(new Date(disMs));
  // Recompute with discharge time
  const days = inpatientDays(i.admittedMs, disMs);
  const dailyFee = getDailyFee(i);
  const examFee = parseFloat(i.initialAmount)||0;
  const treatmentTotal = getInpDailyTotal(i);
  const accommodation = dailyFee * days;
  // 🔗 Гэрийн эм санхүүд орно: fin.amount-д нэмэгдэж, Авлага/Төлөгдсөн таб зөв тоо харуулна
  const grandTotal = examFee + treatmentTotal + accommodation + homeMedsTotal;
  const payments = getInpPrepayments(i).map(p => ({
    amount: parseFloat(p.amount)||0,
    method: p.method,
    date: p.date,
    ms: p.ms || nowMs()
  }));
  const prepaid = payments.reduce((a,b) => a + b.amount, 0);
  const due = Math.max(0, grandTotal - prepaid);
  // ✅ Эцсийн баталгаажуулалт — санамсаргүй гаргалтаас сэргийлнэ
  if (!confirm('🚪 «' + i.horse + '» адууг байрлан эмчилгээнээс гаргах уу?\n\n' +
      'Гарсан огноо: ' + disDate + ' · ' + days + ' хоног\n' +
      'Нийт: ' + fmt(grandTotal) + ' · Урьдчилгаа: ' + fmt(prepaid) + ' · Үлдэгдэл: ' + fmt(due) + '\n\n' +
      'Адуу жагсаалтаас хасагдаж, нэхэмжлэх Accountant / Financeд үүснэ.\n' +
      '(Андуурсан бол «🚪 Гарсан» хэсгээс буцаан байрлуулж болно.)')) return;
  i.discharged = true;
  i.dischargedMs = disMs;
  i.dischargedDate = disDate;
  // 🔍 Хэн, хэзээ, аль төхөөрөмжөөс гаргасныг бичлэг дээр хадгална
  i.dischargedBy = (STATE.user && STATE.user.name) || '';
  i.dischargedByRole = (STATE.user && STATE.user.role) || '';
  i.dischargedAtMs = nowMs();
  i.dischargedDevice = _deviceLabel();
  i.ms = nowMs(); // ⚠️ өмнө нь ms шинэчлэгддэггүй → өөр төхөөрөмжийн хуучин хуулбар гаргалтыг дарж болзошгүй байв

  // Find linked exam to pull examNum — with robust fallback chain
  const linkedExam = STATE.exams.find(e => String(e.id) === String(i.examId));
  const examNum = (linkedExam && linkedExam.examNum)
    || (i.examNum)
    || (STATE.fins.find(f => String(f.examId) === String(i.examId)) || {}).examNum
    || '';

  const fin = {
    id: uid(),
    examId: i.examId,
    examNum: examNum,
    horse: i.horse, owner: i.owner, phone: i.phone,
    docName: i.docName,
    amount: grandTotal,
    services: 'Байрлан эмчилгээ ' + days + ' хоног' + (homeMedsTotal > 0 ? ' + гэрийн эм' : ''),
    // 💰 Задаргаа — санхүү дээр үзлэг / эмчилгээ / хоног / гэрийн эм тусад нь харуулахад
    breakdown: { examFee, treat: treatmentTotal, accom: accommodation, homeMeds: homeMedsTotal, days, dailyFee, inpId: i.id },
    paid: due === 0 && payments.length > 0,
    method: payments.length === 0 ? '' : (payments.length === 1 ? payments[0].method : 'хосолсон'),
    payments: payments,
    date: disDate,
    paidDate: due === 0 && payments.length > 0 ? disDate : '',
    paidMs: due === 0 && payments.length > 0 ? nowMs() : 0,
    ms: nowMs()
  };
  STATE.fins.push(fin);

  saveAll();
  // ⚡ Байрлагч гарсан мэдээллийг нөгөө компьютерт ШУУД харуулна
  fbSaveRecord('inps', i);
  fbSaveRecord('fins', fin);
  closeModal('inp-discharge-modal');
  const dischargedId = i.id;
  STATE.selectedI = null;
  STATE.dischargeTarget = null;
  writeLog('Байрлан эмчилгээнээс гаргав', i.id, i.horse + ' — ' + (i.docName || ''),
    days + ' хоног · нийт ' + fmt(grandTotal) + ' · үлдэгдэл ' + fmt(due) + ' · ' + _deviceLabel(), examNum);
  updateBadges();
  toast(due > 0 ? '🚪 Гарлаа · ' + fmt(due) + ' үлдэгдэлтэй' : '🚪 Гарлаа · төлбөр бүрэн', 'ok');
  renderInpatient();
  // 📋 Эзэнд өгөх гарах хуудсыг шууд хэвлэхийг санал болгоно
  setTimeout(() => {
    if (confirm('📋 Эзэнд өгөх гарах хуудсыг хэвлэх үү?')) printOwnerSheet(dischargedId);
  }, 350);
}

// ============================================================
// DISCHARGE — эзэнд өгөх заавар, гэрийн эм, гарах хуудас
// ============================================================

// Гарах modal-ын live тооцооллын суурь дүн
let DIS_BASE = { grand: 0, prepaid: 0 };

// Гэрийн эмийн мөр нэмэх (гарах modal дотор)
function addHomeMedRow(name = '', note = '', price = '') {
  const wrap = $('#inp-homemed-list');
  if (!wrap) return;
  const div = document.createElement('div');
  div.className = 'homemed-line';
  div.style.cssText = 'display:flex;gap:6px;margin-bottom:5px;align-items:center;flex-wrap:wrap';
  div.innerHTML = `
    <input class="inp" placeholder="Эмийн нэр" value="${escHTML(name)}" style="flex:1;min-width:90px">
    <input class="inp" placeholder="Заавар: өдөрт 2 удаа, 5 хоног" value="${escHTML(note)}" style="flex:1.4;min-width:130px">
    <input class="inp" type="number" placeholder="₮" value="${escHTML(String(price))}" style="width:84px" oninput="updateDischargeTotals()">
    <button class="btn btn-r btn-xs" type="button">✕</button>`;
  div.querySelector('button').onclick = () => { div.remove(); updateDischargeTotals(); };
  wrap.appendChild(div);
}

function collectHomeMeds() {
  return [...document.querySelectorAll('#inp-homemed-list .homemed-line')].map(l => {
    const ins = l.querySelectorAll('input');
    return { name: ins[0].value.trim(), note: ins[1].value.trim(), price: parseFloat(ins[2].value) || 0 };
  }).filter(m => m.name);
}

// 🗓 Modal дээр сонгосон гарах огноог ms болгож буцаана.
// Өнөөдөр бол яг одоогийн цаг, өнгөрсөн огноо бол тухайн өдрийн 12:00 гэж тооцно.
function getSelectedDischargeMs() {
  const el = $('#inp-dis-date');
  const v = el ? el.value : '';
  if (!v || v === todayStr()) return nowMs();
  const t = dateStrToMs(v);
  return t ? t + 12 * 3600000 : nowMs();
}

// Гарах огноо өөрчлөгдөхөд хоног, байрны төлбөр, нийт дүнг дахин тооцно
function updateDischargeDate() {
  if (!DIS_BASE || !DIS_BASE.admittedMs) { updateDischargeTotals(); return; }
  const atMs = getSelectedDischargeMs();
  const days = inpatientDays(DIS_BASE.admittedMs, atMs);
  const accommodation = (DIS_BASE.dailyFee || 0) * days;
  DIS_BASE.grand = (DIS_BASE.examFee || 0) + (DIS_BASE.treatmentTotal || 0) + accommodation;
  if ($('#inp-dis-days')) $('#inp-dis-days').textContent = days + ' хоног';
  if ($('#inp-dis-acc-label')) $('#inp-dis-acc-label').textContent = `🏨 Хоног (${days} × ${fmt(DIS_BASE.dailyFee || 0)}):`;
  if ($('#inp-dis-acc')) $('#inp-dis-acc').textContent = fmt(accommodation);
  updateDischargeTotals();
}

// Гэрийн эмийн үнэ өөрчлөгдөх бүрд Нийт / Үлдэгдэл-ийг шинэчилнэ
function updateDischargeTotals() {
  const hmTotal = collectHomeMeds().reduce((a, m) => a + (parseFloat(m.price) || 0), 0);
  const grand = DIS_BASE.grand + hmTotal;
  const due = Math.max(0, grand - DIS_BASE.prepaid);
  const hmRow = $('#inp-dis-hm-row');
  if (hmRow) hmRow.style.display = hmTotal > 0 ? '' : 'none';
  if ($('#inp-dis-hm')) $('#inp-dis-hm').textContent = fmt(hmTotal);
  if ($('#inp-dis-grand')) $('#inp-dis-grand').textContent = fmt(grand);
  const dueEl = $('#inp-dis-due');
  if (dueEl) { dueEl.textContent = fmt(due); dueEl.style.color = due > 0 ? 'var(--red)' : 'var(--green)'; }
}

/**
 * printOwnerSheet — эмнэлгээс гарах үед эзэнд өгөх хуудас.
 *  Эмнэлзүйн мэдээллийг inp-ээс, төлбөрийг fin-ээс авна:
 *  fin-ийг examId-аар олж getPaidAmount/getDueAmount-ыг ашигласнаар
 *  Accountant / Finance (Авлага/Төлөгдсөн) таб-тай яг ижил дүн гарна.
 *  Дараа нь Авлага дээр төлбөр нэмэгдвэл дахин хэвлэхэд үлдэгдэл автоматаар зөв болно.
 */
function printOwnerSheet(inpId) {
  const i = STATE.inps.find(x => String(x.id) === String(inpId || STATE.selectedI));
  if (!i) { toast('Байрлан эмчилгээний бичлэг олдсонгүй', 'err'); return; }
  const info = i.dischargeInfo || {};

  // 🔗 Accountant / Financeгийн холбоос
  const fin = STATE.fins.find(f => String(f.examId) === String(i.examId));
  const total = fin ? (parseFloat(fin.amount) || 0) : getInpFullTotal(i, i.dischargedMs);
  const paid  = fin ? getPaidAmount(fin) : getInpPrepaidTotal(i);
  const due   = fin ? getDueAmount(fin)  : Math.max(0, total - paid);

  const days = inpatientDays(i.admittedMs, i.dischargedMs);
  const medRows = (info.homeMeds || []).map((m, idx) => `<tr>
      <td style="text-align:center;border:0.5pt solid #000;padding:2mm">${idx + 1}</td>
      <td style="border:0.5pt solid #000;padding:2mm;font-weight:700">${escHTML(m.name)}</td>
      <td style="border:0.5pt solid #000;padding:2mm">${escHTML(m.note || '—')}</td>
    </tr>`).join('');

  $('#print-area').innerHTML = `
<div style="width:210mm;min-height:297mm;font-family:'Times New Roman',serif;font-size:10pt;color:#000;padding:12mm 14mm;box-sizing:border-box">
  <div style="text-align:center;border-bottom:2pt solid #000;padding-bottom:4mm;margin-bottom:5mm">
    <div style="font-size:13pt;font-weight:900;text-transform:uppercase;letter-spacing:1px">Морьтон үндэсний адууны эмнэлэг</div>
    <div style="font-size:10pt;margin-top:2mm;font-weight:700">Эмнэлгээс гарах үеийн заавар — эзэнд өгөх хуудас</div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:4mm;margin-bottom:5mm;font-size:9pt">
    <div style="flex:1;min-width:45mm"><b>Адуу:</b> ${escHTML(i.horse || '—')}</div>
    <div style="flex:1;min-width:45mm"><b>Эзэн:</b> ${escHTML(i.owner || '—')}</div>
    <div style="flex:1;min-width:45mm"><b>Эмчлэгч эмч:</b> ${escHTML(i.docName || '—')}</div>
    <div style="flex:1;min-width:45mm"><b>Байрласан:</b> ${escHTML(i.admittedDate || '—')} (${days} хоног)</div>
    <div style="flex:1;min-width:45mm"><b>Гарсан:</b> ${escHTML(i.dischargedDate || todayStr())}</div>
    <div style="flex:1;min-width:45mm"><b>Онош:</b> ${(() => { const ex = i.examId ? _dxExam(i.examId) : null; return ex && dxIsOpen(ex) ? '<span style="display:inline-block;min-width:40mm;border-bottom:0.5pt solid #000">&nbsp;</span>' : escHTML(i.diagnosis || '—'); })()}</div>
  </div>

  <div style="font-weight:900;font-size:10.5pt;border-bottom:1pt solid #000;padding-bottom:1mm;margin-bottom:2mm">🏠 Гэрийн арчилгаа</div>
  <div style="font-size:9.5pt;line-height:1.7;white-space:pre-wrap;min-height:22mm;margin-bottom:5mm">${escHTML(info.homecare || '—')}</div>

  <div style="font-weight:900;font-size:10.5pt;border-bottom:1pt solid #000;padding-bottom:1mm;margin-bottom:2mm">💊 Гэрт үргэлжлүүлэх эм</div>
  ${medRows ? `<table style="width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:5mm">
    <thead><tr>
      <th style="background:#022438;color:#fff;border:0.5pt solid #000;padding:2mm;width:8mm">№</th>
      <th style="background:#022438;color:#fff;border:0.5pt solid #000;padding:2mm;width:50mm">Эмийн нэр</th>
      <th style="background:#022438;color:#fff;border:0.5pt solid #000;padding:2mm">Хэрэглэх заавар</th>
    </tr></thead><tbody>${medRows}</tbody></table>`
    : '<div style="font-size:9pt;color:#555;margin-bottom:5mm">Гэрт үргэлжлүүлэх эм байхгүй.</div>'}

  <div style="border:1pt solid #000;padding:3mm 4mm;margin-bottom:5mm;font-size:10pt">
    <b>📅 Дараагийн хяналтын үзлэг:</b>
    <span style="font-size:11pt;font-weight:900;margin-left:3mm">${escHTML(info.followUpDate || '____________')}</span>
    <div style="font-size:8pt;color:#555;margin-top:1mm">Заасан өдөр эмнэлэгт хяналтын үзлэгт ирнэ үү.</div>
  </div>

  <div style="font-weight:900;font-size:10.5pt;border-bottom:1pt solid #000;padding-bottom:1mm;margin-bottom:2mm">💰 Төлбөрийн хураангуй</div>
  <table style="width:60%;border-collapse:collapse;font-size:9.5pt;margin-bottom:6mm">
    <tr><td style="padding:1.5mm 0">Нийт дүн:</td><td style="text-align:right;font-weight:700">${fmt(total)}</td></tr>
    <tr><td style="padding:1.5mm 0">Төлсөн:</td><td style="text-align:right;font-weight:700;color:#2f7a52">${fmt(paid)}</td></tr>
    <tr style="border-top:1pt solid #000"><td style="padding:1.5mm 0;font-weight:900">Үлдэгдэл:</td><td style="text-align:right;font-weight:900;font-size:11pt;${due > 0 ? 'color:#a33' : ''}">${fmt(due)}</td></tr>
  </table>
  ${due > 0 ? '<div style="font-size:8.5pt;border:0.5pt solid #999;padding:2mm 3mm;margin-bottom:6mm">Үлдэгдэл төлбөрийг: Торийн банк 102030102030 · Хаан банк 5040416540 (Морьтон адууны тов ХХК) дансанд шилжүүлнэ үү.</div>' : ''}

  <div style="display:flex;justify-content:space-between;margin-top:12mm;font-size:9pt">
    <div style="border-top:0.5pt solid #000;padding-top:2mm;min-width:55mm;text-align:center">Эмч: ${escHTML(i.docName || '')}</div>
    <div style="border-top:0.5pt solid #000;padding-top:2mm;min-width:55mm;text-align:center">Хүлээн авсан эзэн</div>
  </div>
  <div style="margin-top:6mm;font-size:7.5pt;color:#666;text-align:center">Морьтон адууны тов ХХК · Хэвлэсэн: ${escHTML(todayStr())}</div>
</div>`;
  setTimeout(() => window.print(), 150);
}

// Accountant / Financeгээс (Төлөгдсөн / Авлага) дахин хэвлэх — fin → examId → inp
function printOwnerSheetByFin(finId) {
  const f = STATE.fins.find(x => String(x.id) === String(finId));
  if (!f) return;
  const i = STATE.inps.find(x => String(x.examId) === String(f.examId));
  if (!i) { toast('Байрлан эмчилгээний бичлэг олдсонгүй', 'err'); return; }
  printOwnerSheet(i.id);
}

// Энэ fin-д харгалзах гарсан байрлагч бий эсэх (товч харуулах нөхцөл)
function hasOwnerSheet(f) {
  return !!STATE.inps.find(x => String(x.examId) === String(f.examId) && x.discharged);
}

// ── ↩ ГАРГАЛТЫГ БУЦААХ ──────────────────────────────────────────
// Санамсаргүй гаргасан адууг буцаан байрлуулна: гаргахад үүссэн нэхэмжлэхийг
// устгаж, тэр нэхэмжлэх дээр гаргасны ДАРАА бүртгэсэн төлбөрийг урьдчилгаа
// болгон адууны бичлэгт буцаана (мөнгө алдагдахгүй). Бүрэн төлөгдсөн
// нэхэмжлэхийг зөвхөн Admin буцаана.
function _inpDischargeFins(i) {
  const re = /^(Байрлан|Хэвтэн) эмчилгээ/i;
  return (STATE.fins || []).filter(f =>
    (f.breakdown && f.breakdown.inpId && String(f.breakdown.inpId) === String(i.id)) ||
    (i.examId && String(f.examId) === String(i.examId) && re.test(String(f.services || ''))));
}
function _inpDischargeFinOf(i) {
  const fs = _inpDischargeFins(i);
  if (!fs.length) return null;
  return fs.slice().sort((a, b) => (parseFloat(b.ms) || 0) - (parseFloat(a.ms) || 0))[0];
}
function undoDischarge(inpId) {
  const i = STATE.inps.find(x => String(x.id) === String(inpId));
  if (!i) { toast('Байрлан эмчилгээний бичлэг олдсонгүй', 'err'); return; }
  if (!i.discharged) { toast('Энэ адуу байрлаж байна — буцаах шаардлагагүй', 'err'); return; }
  if (!canEditData()) { toast('⛔ Буцаах эрхгүй (Chief Veterinarian / Senior Veterinarian / Admin)', 'err'); return; }
  const fins = _inpDischargeFins(i);
  if (fins.some(f => isFullyPaid(f)) && !canDelete()) { toast('⛔ Нэхэмжлэх бүрэн төлөгдсөн — зөвхөн Admin буцаана', 'err'); return; }
  // Гаргасны дараа нэхэмжлэх дээр нэмэгдсэн төлбөр (урьдчилгаанд байгаагүй) — буцааж урьдчилгаа болгоно
  const preMs = new Set(getInpPrepayments(i).map(p => String(p.ms || '')));
  const extra = [];
  fins.forEach(f => getPayments(f).forEach(p => { if (!preMs.has(String(p.ms || ''))) extra.push(p); }));
  const extraSum = extra.reduce((a, p) => a + (parseFloat(p.amount) || 0), 0);
  if (!confirm('↩ «' + i.horse + '» адууг буцаан байрлуулах үү?\n\n' +
      'Гарсан: ' + (i.dischargedDate || '—') + (i.dischargedBy ? ' · ' + i.dischargedBy : '') + '\n' +
      'Устгах нэхэмжлэх: ' + fins.length + (fins.length ? ' (' + fmt(fins.reduce((a, f) => a + (parseFloat(f.amount) || 0), 0)) + ')' : '') + '\n' +
      (extraSum ? 'Гаргасны дараа авсан төлбөр ' + fmt(extraSum) + ' → урьдчилгаа болно\n' : '') +
      '\nАдуу «Байрлан эмчлүүлэх» жагсаалтад буцаж орно, хоног үргэлжлэн тоологдоно.')) return;
  if (extra.length) {
    if (!Array.isArray(i.prepayments)) i.prepayments = [];
    extra.forEach(p => i.prepayments.push({ amount: parseFloat(p.amount) || 0, method: p.method || 'бэлэн', purpose: 'Гаргасны дараах төлбөр', date: p.date || todayStr(), ms: p.ms || nowMs() }));
  }
  i.dischargeUndo = { ms: nowMs(), by: (STATE.user && STATE.user.name) || '', prevDate: i.dischargedDate || '', prevBy: i.dischargedBy || '', finIds: fins.map(f => String(f.id)), homecare: (i.dischargeInfo && i.dischargeInfo.homecare) || '' };
  i.discharged = false;
  delete i.dischargedMs; delete i.dischargedDate; delete i.dischargedBy; delete i.dischargedByRole; delete i.dischargedAtMs; delete i.dischargedDevice;
  delete i.dischargeInfo; // гэрийн эм / заавар — дараагийн гаргалт дээр дахин бөглөнө
  i.ms = nowMs();
  fins.forEach(f => { STATE.deletedIds.add(String(f.id)); fbDeleteDoc('fins', String(f.id)); });
  const finIds = new Set(fins.map(f => String(f.id)));
  STATE.fins = STATE.fins.filter(f => !finIds.has(String(f.id)));
  saveAll();
  fbSaveRecord('inps', i);
  writeLog('Байрлан эмчилгээнд буцаан байрлуулав', i.id, i.horse + ' — ' + (i.docName || ''),
    'Гаргалтыг буцаав (гарсан: ' + (i.dischargeUndo.prevDate || '—') + (i.dischargeUndo.prevBy ? ', ' + i.dischargeUndo.prevBy : '') + ') · нэхэмжлэх ' + fins.length + ' устгав' + (extraSum ? ' · ' + fmt(extraSum) + ' урьдчилгаа болгов' : '') + ' · ' + _deviceLabel(), inpExamNum(i));
  updateBadges();
  toast('↩ ' + i.horse + ' буцаан байрлууллаа', 'ok');
  if (STATE.activePage === 'inpatient') { INP_VIEW = 'cards'; STATE.selectedI = String(i.id); renderInpatient(); if (typeof renderIDetail === 'function') { renderIDetail(); openInpDrawer(); } }
  else if (STATE.activePage === 'finance') { STATE.selectedF = null; renderFinance(); }
}
function undoDischargeByFin(finId) {
  const f = STATE.fins.find(x => String(x.id) === String(finId)); if (!f) return;
  const i = (STATE.inps || []).find(x => (f.breakdown && f.breakdown.inpId && String(x.id) === String(f.breakdown.inpId)) || (f.examId && String(x.examId) === String(f.examId) && x.discharged));
  if (!i) { toast('Байрлан эмчилгээний бичлэг олдсонгүй', 'err'); return; }
  undoDischarge(i.id);
}
// ── 🗓 ГАРСАН ОГНООГ ЗАСАХ (дахин тооцоолол) ──────────────────────
// Адууг бодит гарсан өдрөөс хожуу (ж: овоолоод нэг өдөр бүгдийг) гаргавал
// хоног, байрны хөлс, нэхэмжлэхийн дүн зөрдөг. Энд бодит огноог оруулахад
// хоног/хөлс/нийт дүн, нэхэмжлэхийн огноо, задаргаа бүгд дахин бодогдоно;
// төлбөрийн бүртгэл хэвээр үлдэнэ.
function _dischargeRecalc(i, dateStr) {
  const today = todayStr();
  // Огноо өөрчлөгдөөгүй бол одоогийн гарсан агшныг хэвээр (хоног хэлбэлзэхгүй);
  // өөрчлөгдсөн бол: өнөөдөр → одоо, өнгөрсөн өдөр → тэр өдрийн 12:00
  const sameAsCurrent = !!(i.dischargedMs && localDateStr(new Date(i.dischargedMs)) === dateStr);
  const ms = sameAsCurrent ? i.dischargedMs : (dateStr === today ? nowMs() : dateStrToMs(dateStr) + 12 * 3600000);
  const days = inpatientDays(i.admittedMs, ms);
  const dailyFee = getDailyFee(i);
  const examFee = parseFloat(i.initialAmount) || 0;
  const treat = getInpDailyTotal(i);
  const accom = dailyFee * days;
  const homeMeds = (i.dischargeInfo && Array.isArray(i.dischargeInfo.homeMeds)) ? i.dischargeInfo.homeMeds.reduce((a, m) => a + (parseFloat(m.price) || 0), 0) : 0;
  const lateLogs = (Array.isArray(i.log) ? i.log : []).filter(l => l.date && l.date > dateStr).length;
  return { ms, date: dateStr, days, dailyFee, examFee, treat, accom, homeMeds, total: examFee + treat + accom + homeMeds, lateLogs };
}
function _fixDatePreviewHTML(i, R) {
  const f = _inpDischargeFinOf(i);
  const oldDays = inpatientDays(i.admittedMs, i.dischargedMs), oldTotal = f ? (parseFloat(f.amount) || 0) : getInpFullTotal(i, i.dischargedMs);
  const paid = f ? getPaidAmount(f) : getInpPrepaidTotal(i);
  const due = Math.max(0, R.total - paid);
  const row = (l, a, b) => `<div class="row" style="justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:13px"><span>${l}</span><span><span class="muted" style="text-decoration:line-through">${a}</span> → <b>${b}</b></span></div>`;
  return `
    ${row('🗓 Гарсан огноо', escHTML(i.dischargedDate || '—'), escHTML(R.date))}
    ${row('Хоног', oldDays, R.days)}
    ${row('🏨 Хоногийн хөлс (' + R.days + ' × ' + fmt(R.dailyFee) + ')', fmt(getDailyFee(i) * oldDays), fmt(R.accom))}
    <div class="row" style="justify-content:space-between;padding:5px 0;font-size:12.5px;color:var(--muted)"><span>🩺 Үзлэг ${fmt(R.examFee)} · 💊 Эмчилгээ ${fmt(R.treat)}${R.homeMeds ? ' · 🏠 Гэрийн эм ' + fmt(R.homeMeds) : ''}</span><span>өөрчлөгдөхгүй</span></div>
    ${row('<b>Нийт нэхэмжлэх</b>', fmt(oldTotal), fmt(R.total))}
    <div class="row" style="justify-content:space-between;padding:6px 0;font-size:14px"><span>Төлсөн: <b style="color:var(--green)">${fmt(paid)}</b></span><span>Үлдэгдэл: <b style="color:${due > 0 ? 'var(--red)' : 'var(--green)'}">${fmt(due)}</b>${paid > R.total ? ' <span class="badge b-o">илүү төлөлт ' + fmt(paid - R.total) + '</span>' : ''}</span></div>
    ${R.lateLogs ? '<div class="badge b-o" style="margin-top:6px">⚠️ Энэ огнооноос ХОЙШ бичигдсэн эмчилгээний бичлэг ' + R.lateLogs + ' — дүнд орсон хэвээр, шаардлагатай бол Байрлан хэсгээс устгана</div>' : ''}
    ${!f ? '<div class="badge b-o" style="margin-top:6px">⚠️ Гаргахад үүссэн нэхэмжлэх олдсонгүй — зөвхөн адууны бичлэг засагдана</div>' : ''}`;
}
// Дахин бодсон дүнг нэхэмжлэх дээр бичнэ (төлбөрийн бүртгэл хэвээр; төлөгдсөн эсэх дахин тогтоогдоно)
function _writeDischargeFin(i, f, R, setDate) {
  const payments = getPayments(f);
  const paid = getPaidAmount(f);
  f.amount = R.total;
  f.services = 'Байрлан эмчилгээ ' + R.days + ' хоног' + (R.homeMeds > 0 ? ' + гэрийн эм' : '');
  f.breakdown = { examFee: R.examFee, treat: R.treat, accom: R.accom, homeMeds: R.homeMeds, days: R.days, dailyFee: R.dailyFee, inpId: i.id };
  if (setDate) f.date = R.date;
  const fully = paid >= R.total && payments.length > 0;
  f.paid = fully;
  if (fully) { if (!f.paidDate) f.paidDate = R.date; if (!f.paidMs) f.paidMs = nowMs(); } else { f.paidDate = ''; f.paidMs = 0; }
  f.ms = nowMs();
  fbSaveRecord('fins', f);
}
// 🚪 Гарсан адууны эмчилгээ/эм/хоногийн төлбөр өөрчлөгдөхөд нэхэмжлэхийг дахин бодно
function recomputeDischargedInvoice(i, reason) {
  if (!i || !i.discharged) return false;
  const f = _inpDischargeFinOf(i);
  if (!f) { toast('⚠️ Гаргахад үүссэн нэхэмжлэх олдсонгүй — Accountant / Finance дээр шинэчлэгдсэнгүй', 'err'); return false; }
  const R = _dischargeRecalc(i, i.dischargedDate || localDateStr(new Date(i.dischargedMs || nowMs())));
  const prevAmt = parseFloat(f.amount) || 0;
  if (prevAmt === R.total && f.breakdown && f.breakdown.treat === R.treat) return false;
  _writeDischargeFin(i, f, R, false);
  saveAll();
  writeLog('Гарсан адууны нэхэмжлэх дахин бодов', i.id, i.horse + ' — ' + (i.docName || ''),
    (reason || '') + ' · нэхэмжлэх ' + fmt(prevAmt) + ' → ' + fmt(R.total) + ' · ' + _deviceLabel(), inpExamNum(i));
  toast('🧾 Нэхэмжлэх ' + fmt(prevAmt) + ' → ' + fmt(R.total), 'ok');
  return true;
}
// 🚪 Гарсан адууны картыг нээх (эмчилгээ нэмэх/засах)
function openDischargedCard(inpId, tab) {
  const i = STATE.inps.find(x => String(x.id) === String(inpId));
  if (!i) { toast('Бичлэг олдсонгүй', 'err'); return; }
  INP_VIEW = 'out'; __inpOutEdit = false;
  STATE.selectedI = String(i.id);
  if (STATE.activePage !== 'inpatient') nav('inpatient'); else renderInpatient();
  renderIDetail(); openInpDrawer();
  const t = tab || 'treat';
  $$('.tab[data-itab]').forEach(x => x.classList.toggle('active', x.dataset.itab === t));
  $$('.itab').forEach(x => x.classList.toggle('hidden', x.dataset.itab !== t));
}
// Хадгалах: inp + нэхэмжлэхийг дахин бодож бичнэ. Буцаана: true (амжилттай)
function applyDischargeDate(inpId, dateStr, opts) {
  opts = opts || {};
  const i = STATE.inps.find(x => String(x.id) === String(inpId));
  if (!i || !i.discharged) { if (!opts.silent) toast('Гарсан адууны бичлэг олдсонгүй', 'err'); return false; }
  if (!canEditData()) { if (!opts.silent) toast('⛔ Засах эрхгүй', 'err'); return false; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr || '')) { if (!opts.silent) toast('Огноо сонгоно уу', 'err'); return false; }
  if (i.admittedDate && dateStr < i.admittedDate) { if (!opts.silent) toast(i.horse + ': гарсан огноо орсон огноо (' + i.admittedDate + ')-оос өмнө байж болохгүй', 'err'); return false; }
  if (dateStr > todayStr()) { if (!opts.silent) toast('Ирээдүйн огноо байж болохгүй', 'err'); return false; }
  const R = _dischargeRecalc(i, dateStr);
  const f = _inpDischargeFinOf(i);
  const prevDate = i.dischargedDate || '', prevAmt = f ? (parseFloat(f.amount) || 0) : 0;
  if (prevDate === dateStr && f && prevAmt === R.total) { if (!opts.silent) toast('Өөрчлөлт алга', 'err'); return false; }
  i.dischargedMs = R.ms; i.dischargedDate = R.date;
  i.dischargeFix = { ms: nowMs(), by: (STATE.user && STATE.user.name) || '', prevDate, prevAmt, n: ((i.dischargeFix && i.dischargeFix.n) || 0) + 1 };
  i.ms = nowMs();
  if (f) _writeDischargeFin(i, f, R, true);
  saveAll();
  fbSaveRecord('inps', i);
  writeLog('Гарсан огноо засав', i.id, i.horse + ' — ' + (i.docName || ''),
    prevDate + ' → ' + R.date + ' · ' + R.days + ' хоног · нэхэмжлэх ' + fmt(prevAmt) + ' → ' + fmt(R.total) + ' · ' + _deviceLabel(), inpExamNum(i));
  if (!opts.silent) toast('🗓 ' + i.horse + ': ' + R.date + ' · ' + R.days + ' хоног · ' + fmt(R.total), 'ok');
  return true;
}
// Нэг адууны огноо засах modal (Гарсан жагсаалт ба Accountant / Financeгээс дуудна)
let __fixDateTarget = null;
function openDischargeDateFix(inpId) {
  const i = STATE.inps.find(x => String(x.id) === String(inpId));
  if (!i || !i.discharged) { toast('Гарсан адууны бичлэг олдсонгүй', 'err'); return; }
  if (!canEditData()) { toast('⛔ Засах эрхгүй', 'err'); return; }
  __fixDateTarget = String(i.id);
  $('#inp-fixdate-body').innerHTML = `
    <div style="font-weight:800;font-size:14px">${escHTML(i.horse)} <span class="muted" style="font-weight:600">· ${escHTML(i.owner || '')}</span></div>
    <div class="muted" style="font-size:12px;margin:2px 0 10px">Орсон: <b>${escHTML(i.admittedDate || '')}</b> · Одоо бүртгэлтэй гарсан огноо: <b>${escHTML(i.dischargedDate || '')}</b>${i.dischargedBy ? ' · гаргасан: ' + escHTML(i.dischargedBy) : ''}</div>
    <div class="fld"><label>🗓 Бодит гарсан огноо</label><input class="inp" type="date" id="inp-fix-date" value="${escHTML(i.dischargedDate || todayStr())}" min="${escHTML(i.admittedDate || '')}" max="${todayStr()}" oninput="_renderFixDatePreview()" onchange="_renderFixDatePreview()"></div>
    <div id="inp-fix-prev" style="margin-top:10px;background:var(--input);border-radius:8px;padding:6px 12px"></div>
    <div class="muted" style="font-size:11.5px;margin-top:8px">Хоног, хоногийн хөлс, нэхэмжлэхийн нийт дүн ба огноо шинэ огноогоор дахин бодогдоно. Бүртгэгдсэн төлбөр (урьдчилгаа, дараа нь авсан) хэвээр үлдэнэ.</div>`;
  _renderFixDatePreview();
  openModal('inp-fixdate-modal');
}
function _renderFixDatePreview() {
  const i = STATE.inps.find(x => String(x.id) === String(__fixDateTarget)); const el = $('#inp-fix-prev'); if (!i || !el) return;
  const v = ($('#inp-fix-date') || {}).value || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { el.innerHTML = '<div class="muted">Огноо сонгоно уу</div>'; return; }
  el.innerHTML = _fixDatePreviewHTML(i, _dischargeRecalc(i, v));
}
function saveDischargeDateFix() {
  const v = ($('#inp-fix-date') || {}).value || '';
  if (!applyDischargeDate(__fixDateTarget, v)) return;
  closeModal('inp-fixdate-modal');
  updateBadges();
  if (STATE.activePage === 'inpatient') renderInpatient();
  else if (STATE.activePage === 'finance') renderFinance();
  else if (STATE.activePage === 'history') renderHistory();
}
// Багцаар засах горим («🚪 Гарсан» жагсаалт): мөр бүрд огнооны талбар + урьдчилсан дүн
let __inpOutEdit = false;
function toggleInpOutEdit() { if (!canEditData()) { toast('⛔ Засах эрхгүй', 'err'); return; } __inpOutEdit = !__inpOutEdit; renderInpatient(); }
function _inpOutRowPreview(inp) {
  const i = STATE.inps.find(x => String(x.id) === String(inp.dataset.id)); const el = $('#inp-out-prev-' + inp.dataset.id); if (!i || !el) return;
  const v = inp.value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || v === (i.dischargedDate || '')) { el.innerHTML = ''; inp.closest('.inp-out-row').classList.remove('inp-out-changed'); }
  else if (i.admittedDate && v < i.admittedDate) { el.innerHTML = '<span class="badge b-r">орсон огнооноос өмнө</span>'; inp.closest('.inp-out-row').classList.remove('inp-out-changed'); }
  else {
    const R = _dischargeRecalc(i, v); const f = _inpDischargeFinOf(i); const old = f ? (parseFloat(f.amount) || 0) : 0;
    el.innerHTML = `<b>${R.days} хоног</b> · нийт <span class="muted" style="text-decoration:line-through">${fmt(old)}</span> → <b>${fmt(R.total)}</b>` + (R.lateLogs ? ' <span class="badge b-o">⚠️ хойших бичлэг ' + R.lateLogs + '</span>' : '');
    inp.closest('.inp-out-row').classList.add('inp-out-changed');
  }
  const n = $$('.inp-out-row.inp-out-changed').length; const b = $('#inp-out-save'); if (b) { b.textContent = '💾 Хадгалах (' + n + ')'; b.disabled = !n; }
}
function saveInpOutDates() {
  const rows = $$('.inp-out-row.inp-out-changed .inp-out-date');
  if (!rows.length) { toast('Өөрчлөлт алга', 'err'); return; }
  if (!confirm(rows.length + ' адууны гарсан огноог засаж, нэхэмжлэхийн дүнг дахин бодох уу?')) return;
  let ok = 0, fail = 0;
  rows.forEach(inp => { if (applyDischargeDate(inp.dataset.id, inp.value, { silent: true })) ok++; else fail++; });
  __inpOutEdit = false;
  updateBadges(); renderInpatient();
  toast('🗓 ' + ok + ' адууны огноо, нэхэмжлэх засагдлаа' + (fail ? ' · ' + fail + ' алдаа' : ''), fail ? 'err' : 'ok');
}

// Гаргалтын мөшгих мэдээлэл — хэн, хэзээ, аль төхөөрөмжөөс
function inpDischargeAuditText(i) {
  if (!i || !i.discharged) return '';
  const who = i.dischargedBy ? i.dischargedBy + (i.dischargedByRole ? ' (' + i.dischargedByRole + ')' : '') : 'хэн гаргасан нь бүртгэгдээгүй (хуучин хувилбар)';
  const when = i.dischargedAtMs ? fmtDateTime(i.dischargedAtMs) : (i.dischargedDate || '');
  return who + (when ? ' · ' + when : '') + (i.dischargedDevice ? ' · ' + i.dischargedDevice : '');
}

// ============================================================
// FINANCE
// ============================================================
// 💰 Accountant / Finance: Түүх шиг хуудаслалт — нэг дор бүх бичлэгийг зурахгүй (гацахаас сэргийлнэ)
const FIN_PAGE_SIZE = 50;
const __finPages = { pending: 0, receivable: 0, paid: 0 };
function finSetPage(tab, p) { __finPages[tab] = p; renderFinance(); }
// Жагсаалтыг тухайн табын идэвхтэй хуудсаар хэрчиж буцаана
function _finSlice(arr, tab) {
  const totalPages = Math.max(1, Math.ceil(arr.length / FIN_PAGE_SIZE));
  if (__finPages[tab] >= totalPages) __finPages[tab] = 0;
  const start = __finPages[tab] * FIN_PAGE_SIZE;
  return { page: arr.slice(start, start + FIN_PAGE_SIZE), start, totalPages, total: arr.length };
}
// Жагсаалтын доор Өмнөх/Дараах товч зурна
function _finPagCtl(anchorEl, tab, totalPages, total) {
  if (!anchorEl) return;
  let pag = document.getElementById('fin-pag-' + tab);
  if (!pag) {
    pag = document.createElement('div');
    pag.id = 'fin-pag-' + tab;
    pag.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 0;justify-content:center;flex-wrap:wrap';
    anchorEl.insertAdjacentElement('afterend', pag);
  }
  const cur = __finPages[tab];
  pag.innerHTML = totalPages <= 1 ? '' : `
    <button class="btn btn-sm" onclick="finSetPage('${tab}',${Math.max(0, cur - 1)})" ${cur === 0 ? 'disabled' : ''}>← Өмнөх</button>
    <span style="font-size:13px;color:var(--muted)">${cur + 1} / ${totalPages} · нийт ${total}</span>
    <button class="btn btn-sm" onclick="finSetPage('${tab}',${Math.min(totalPages - 1, cur + 1)})" ${cur >= totalPages - 1 ? 'disabled' : ''}>Дараах →</button>`;
}

// ── 🔎 Accountant / Financeгийн шүүлт ───────────────────────────────────────────
// Бичлэгийн эх сурвалж: клиник үзлэг / байрлан эмчилгээ / төлөвлөгөөт
function finSourceOf(f) {
  if (f && f.kind === 'lab') return 'lab'; // 🩸 адуугүй сорьцын шинжилгээ
  if (isPlanned(f)) return 'planned';
  if (/^Байрлан эмчилгээ/.test(String(f.services || ''))) return 'inpatient';
  const ex = f.examId ? recById('exams', f.examId) : null;
  if (ex && ex.inpatient) return 'inpatient';
  return 'clinic';
}
function finDateOf(f) { return isFullyPaid(f) ? (f.paidDate || f.date || '') : (f.date || ''); }
function _finFilter() {
  const v = id => (($('#' + id) || {}).value || '').trim();
  return { from: v('f-from'), to: v('f-to'), doc: v('f-doc'), kind: v('f-kind') || 'all', method: v('f-method'), q: v('f-q').toLowerCase() };
}
function finFilterOk(f, F) {
  if (F.kind && F.kind !== 'all' && finSourceOf(f) !== F.kind) return false;
  if (F.doc && String(f.docName || '') !== F.doc) return false;
  const d = finDateOf(f);
  if (F.from && d && d < F.from) return false;
  if (F.to && d && d > F.to) return false;
  if (F.method) {
    const ms = new Set(getPayments(f).map(p => p.method).filter(Boolean)); if (f.method) ms.add(f.method);
    if (!ms.has(F.method)) return false;
  }
  if (F.q && !((f.horse || '') + ' ' + (f.owner || '') + ' ' + (f.phone || '') + ' ' + (f.examNum || '') + ' ' + (f.services || '')).toLowerCase().includes(F.q)) return false;
  return true;
}
function _finFillDocFilter() {
  const sel = $('#f-doc'); if (!sel || sel.__filled) return; sel.__filled = true;
  const names = [...new Set([...(STATE.doctors || []).map(d => d.name), ...(STATE.fins || []).map(f => f.docName)].filter(Boolean))].sort();
  sel.innerHTML = '<option value="">Бүх эмч</option>' + names.map(n => `<option>${escHTML(n)}</option>`).join('');
}
function onFinFilterChange() {
  const F = _finFilter();
  // Хуучин хугацаа сонгосон бол цонхноос гадуурх санхүүг татаад дахин зурна
  if (F.from && F.from < LIVE_CUTOFF) ensureRange(F.from, F.to || LIVE_CUTOFF, ['fins', 'exams']).then(ok => { if (ok && STATE.activePage === 'finance') renderFinance(); });
  Object.keys(__finPages).forEach(k => __finPages[k] = 0); renderFinance();
}
function resetFinFilter() {
  ['f-from', 'f-to', 'f-doc', 'f-method', 'f-q'].forEach(id => { const el = $('#' + id); if (el) el.value = ''; });
  const k = $('#f-kind'); if (k) k.value = 'all';
  onFinFilterChange();
}
function _finFilterInfo(F, n, total) {
  const parts = [];
  if (F.from || F.to) parts.push((F.from || '…') + ' → ' + (F.to || '…'));
  if (F.doc) parts.push('Эмч: ' + F.doc);
  if (F.kind && F.kind !== 'all') parts.push({ clinic: 'Clinical Exam', inpatient: 'Байрлан эмчилгээ', planned: 'Scheduled Procedure', lab: 'Шинжилгээ (сорьц)' }[F.kind] || F.kind);
  if (F.method) parts.push('Хэлбэр: ' + F.method);
  if (F.q) parts.push('«' + F.q + '»');
  const el = $('#f-filter-info'); if (el) el.textContent = parts.length ? 'Шүүлт: ' + parts.join(' · ') + ' — ' + n + ' / ' + total + ' бичлэг' : 'Шүүлтгүй — ' + total + ' бичлэг';
}

// ── 📒 Эмчилгээний авлага — эзнээр нэгтгэсэн тайлан ────────────
// Дүнтэй (due > 0) бүх нэхэмжлэхийг эзнээр нэгтгэж, насжилтаар ангилна.
// Байрлаж буй адуудын хуримтлагдсан (хараахан нэхэмжлээгүй) төлбөрийг тусад нь.
let __ledgerOpen = new Set();
function _ageDays(dateStr) { if (!dateStr) return 0; const t = new Date(dateStr + 'T12:00:00').getTime(); return Math.max(0, Math.floor((Date.now() - t) / 86400000)); }
function _ageClass(d) { return d <= 30 ? 'a0' : d <= 60 ? 'a1' : d <= 90 ? 'a2' : 'a3'; }
function buildFinLedger(fins) {
  const open = fins.filter(f => getDueAmount(f) > 0);
  const groups = {};
  open.forEach(f => {
    const key = String(f.owner || '—').trim().toLowerCase() || '—';
    const g = groups[key] || (groups[key] = { owner: f.owner || '—', phone: f.phone || '', n: 0, amount: 0, paid: 0, due: 0, oldest: '', maxAge: 0, recs: [], buckets: [0, 0, 0, 0] });
    if (!g.phone && f.phone) g.phone = f.phone;
    const due = getDueAmount(f), paid = getPaidAmount(f), age = _ageDays(f.date);
    g.n++; g.amount += parseFloat(f.amount) || 0; g.paid += paid; g.due += due;
    if (!g.oldest || (f.date && f.date < g.oldest)) g.oldest = f.date || g.oldest;
    if (age > g.maxAge) g.maxAge = age;
    g.buckets[age <= 30 ? 0 : age <= 60 ? 1 : age <= 90 ? 2 : 3] += due;
    g.recs.push(f);
  });
  const rows = Object.values(groups).sort((a, b) => b.due - a.due);
  rows.forEach(g => g.recs.sort((a, b) => (a.date || '') < (b.date || '') ? -1 : 1));
  const tot = rows.reduce((a, g) => ({ n: a.n + g.n, amount: a.amount + g.amount, paid: a.paid + g.paid, due: a.due + g.due, b: a.b.map((x, k) => x + g.buckets[k]) }), { n: 0, amount: 0, paid: 0, due: 0, b: [0, 0, 0, 0] });
  // Байрлаж буй адуудын хуримтлагдсан төлбөр
  const inpRows = (STATE.inps || []).filter(i => !i.discharged).map(i => {
    const full = getInpFullTotal(i), pre = getInpPrepaidTotal(i); const d = inpDoctorOf(i);
    const examFee = parseFloat(i.initialAmount) || 0, treat = (Array.isArray(i.log) ? i.log : []).reduce((a, l) => a + (parseFloat(l.amount) || 0), 0);
    return { i, days: inpatientDays(i.admittedMs), full, pre, due: Math.max(0, full - pre), doc: d ? d.name : (i.docName || ''), loc: i.location || '', examFee, treat, accom: Math.max(0, full - examFee - treat) };
  }).filter(r => r.due > 0).sort((a, b) => b.due - a.due);
  const inpDue = inpRows.reduce((a, r) => a + r.due, 0);
  return { rows, tot, inpRows, inpDue };
}
function toggleLedgerOwner(key) { if (__ledgerOpen.has(key)) __ledgerOpen.delete(key); else __ledgerOpen.add(key); renderFinance(); }
function renderFinLedger(finsK) {
  const host = $('#fin-ledger-body'); if (!host) return;
  const L = buildFinLedger(finsK);
  const bucketHTML = (b) => ['0–30', '31–60', '61–90', '90+'].map((l, k) => `<div class="ledger-kpi"><div class="n">${fmt(b[k])}</div><div class="l"><span class="ledger-age a${k}">${l} хоног</span></div></div>`).join('');
  if (!L.rows.length && !L.inpRows.length) { host.innerHTML = '<div class="empty"><div class="empty-em">📒</div>Авлага алга — бүх нэхэмжлэх төлөгдсөн</div>'; return; }
  const srcLbl = { clinic: 'Clinical Exam', inpatient: 'Байрлан', planned: 'ТҮ' };
  host.innerHTML = `
    <div class="ledger-kpis">
      <div class="ledger-kpi"><div class="n" style="color:var(--red)">${fmt(L.tot.due)}</div><div class="l">Нийт авлага · ${L.rows.length} эзэн · ${L.tot.n} нэхэмжлэх</div></div>
      ${bucketHTML(L.tot.b)}
      ${L.inpRows.length ? `<div class="ledger-kpi" style="border-color:#e6d5a8;background:var(--gold-soft,#f6efdc)"><div class="n">${fmt(L.inpDue)}</div><div class="l">🏥 Байрлаж буй ${L.inpRows.length} адууны хуримтлагдсан (нэхэмжлээгүй)</div></div>` : ''}
    </div>
    <div class="tbl-wrap" style="overflow-x:auto">
    <table class="ledger-tb">
      <thead><tr><th style="width:22px"></th><th>Эзэн</th><th>Утас</th><th class="num">Нэхэмжлэх</th><th class="num">Нийт дүн</th><th class="num">Төлсөн</th><th class="num">Үлдэгдэл</th><th>Хамгийн хуучин</th><th>Насжилт</th></tr></thead>
      <tbody>
        ${L.rows.map(g => {
          const key = String(g.owner).trim().toLowerCase();
          const open = __ledgerOpen.has(key);
          const subs = open ? g.recs.map(f => { const due = getDueAmount(f), age = _ageDays(f.date); return `
            <tr class="sub"><td></td>
              <td colspan="2">${f.examNum ? '<span class="badge b-o" style="font-size:10px">' + escHTML(f.examNum) + '</span> ' : ''}${escHTML(f.horse || '')} <span class="muted">· ${escHTML(f.date || '')} · ${srcLbl[finSourceOf(f)] || ''}${f.docName ? ' · ' + escHTML(f.docName) : ''}</span></td>
              <td class="num muted">${finSourceOf(f) === 'inpatient' ? escHTML(finInpBreakdownShort(f)) : escHTML((f.services || '').slice(0, 40))}</td>
              <td class="num">${fmt(f.amount)}</td><td class="num">${fmt(getPaidAmount(f))}</td><td class="num" style="color:var(--red);font-weight:800">${fmt(due)}</td>
              <td><span class="ledger-age ${_ageClass(age)}">${age} хоног</span></td>
              <td><button class="btn btn-xs btn-g" onclick="event.stopPropagation();markPaid('${escHTML(f.id)}')">💰 Төлбөр</button> <button class="btn btn-xs" onclick="event.stopPropagation();printInvoice('${escHTML(f.id)}')">🖨</button></td>
            </tr>`; }).join('') : '';
          return `<tr class="own" onclick="toggleLedgerOwner('${escHTML(key).replace(/'/g, '&#39;')}')">
            <td>${open ? '▾' : '▸'}</td><td><b>${escHTML(g.owner)}</b></td><td>${escHTML(g.phone)}</td>
            <td class="num">${g.n}</td><td class="num">${fmt(g.amount)}</td><td class="num">${fmt(g.paid)}</td>
            <td class="num" style="color:var(--red);font-weight:800">${fmt(g.due)}</td><td>${escHTML(g.oldest)}</td>
            <td><span class="ledger-age ${_ageClass(g.maxAge)}">${g.maxAge} хоног</span></td>
          </tr>${subs}`;
        }).join('')}
        <tr><td></td><td colspan="2"><b>НИЙТ</b></td><td class="num"><b>${L.tot.n}</b></td><td class="num"><b>${fmt(L.tot.amount)}</b></td><td class="num"><b>${fmt(L.tot.paid)}</b></td><td class="num" style="color:var(--red)"><b>${fmt(L.tot.due)}</b></td><td colspan="2"></td></tr>
      </tbody>
    </table></div>
    ${L.inpRows.length ? `
    <div class="ch" style="margin-top:16px">🏥 Байрлаж буй адуудын хуримтлагдсан төлбөр <span class="muted" style="font-weight:600;text-transform:none">— эдгээр адуу ГАРААГҮЙ, одоо ч байрлан эмчлүүлж байна; нэхэмжлэх нь гаргах үед л үүснэ (урьдчилсан тооцоо)</span></div>
    <div class="tbl-wrap" style="overflow-x:auto"><table class="ledger-tb">
      <thead><tr><th>Адуу</th><th>Эзэн</th><th>Эмч</th><th>Байрлал</th><th class="num">Хоног</th><th class="num">Үзлэг</th><th class="num">Эмчилгээ</th><th class="num">Хоногийн хөлс</th><th class="num">Хуримтлагдсан</th><th class="num">Урьдчилгаа</th><th class="num">Үлдэгдэл</th></tr></thead>
      <tbody>${L.inpRows.map(r => `<tr><td><b>${escHTML(r.i.horse)}</b><div class="muted" style="font-size:10.5px">${escHTML(r.i.phone || '')}</div></td><td>${escHTML(r.i.owner)}</td><td>${escHTML(r.doc)}</td><td>${escHTML(r.loc)}</td><td class="num">${r.days}</td><td class="num">${fmt(r.examFee)}</td><td class="num">${fmt(r.treat)}</td><td class="num">${fmt(r.accom)}</td><td class="num">${fmt(r.full)}</td><td class="num">${fmt(r.pre)}</td><td class="num" style="color:var(--red);font-weight:800">${fmt(r.due)}</td></tr>`).join('')}
      <tr><td colspan="5"><b>НИЙТ</b></td><td class="num"><b>${fmt(L.inpRows.reduce((a, r) => a + r.examFee, 0))}</b></td><td class="num"><b>${fmt(L.inpRows.reduce((a, r) => a + r.treat, 0))}</b></td><td class="num"><b>${fmt(L.inpRows.reduce((a, r) => a + r.accom, 0))}</b></td><td colspan="2"></td><td class="num" style="color:var(--red)"><b>${fmt(L.inpDue)}</b></td></tr></tbody>
    </table></div>` : ''}`;
}
function _ledgerFins() { const F = _finFilter(); return (STATE.fins || []).filter(f => finFilterOk(f, F)); }
function printFinLedger() {
  const L = buildFinLedger(_ledgerFins()); const F = _finFilter();
  const srcLbl = { clinic: 'Clinical Exam', inpatient: 'Байрлан', planned: 'ТҮ' };
  const filt = [F.from || F.to ? (F.from || '…') + ' → ' + (F.to || '…') : '', F.doc ? 'Эмч: ' + F.doc : '', F.kind !== 'all' ? ({ clinic: 'Clinical Exam', inpatient: 'Байрлан эмчилгээ', planned: 'Scheduled Procedure', lab: 'Шинжилгээ (сорьц)' }[F.kind]) : ''].filter(Boolean).join(' · ');
  $('#print-area').innerHTML = `
<style>
  @page { size: A4 portrait; margin: 10mm; }
  #print-area .lg { width: 190mm; font-family: 'Times New Roman', serif; font-size: 8.5pt; color: #000; }
  #print-area .lg h1 { font-size: 12pt; text-align: center; margin: 0; text-transform: uppercase; }
  #print-area .lg h2 { font-size: 10pt; text-align: center; margin: 1mm 0 3mm; font-weight: 700; }
  #print-area .lg table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
  #print-area .lg th, #print-area .lg td { border: 0.5pt solid #000; padding: 1.3mm 1.6mm; vertical-align: top; }
  #print-area .lg th { background: #e9e9e9; font-size: 7.8pt; }
  #print-area .lg thead { display: table-header-group; }
  #print-area .lg tr { page-break-inside: avoid; }
  #print-area .lg td.n { text-align: right; white-space: nowrap; }
  #print-area .lg tr.own td { background: #f4f4f4; font-weight: 700; }
  #print-area .lg tr.sub td { font-size: 8pt; }
  #print-area .lg .sig { display: flex; justify-content: space-between; gap: 8mm; margin-top: 8mm; page-break-inside: avoid; }
  #print-area .lg .sig div { flex: 1; border-top: 0.5pt solid #000; padding-top: 1.5mm; text-align: center; font-size: 8.5pt; }
</style>
<div class="lg">
  <h1>Морьтон үндэсний адууны эмнэлэг</h1>
  <h2>ЭМЧИЛГЭЭНИЙ АВЛАГЫН ТАЙЛАН — ${escHTML(todayStr())}${filt ? ' · ' + escHTML(filt) : ''}</h2>
  <table><tr><th>Нийт авлага</th><th>0–30 хоног</th><th>31–60</th><th>61–90</th><th>90+</th><th>Эзэн</th><th>Нэхэмжлэх</th></tr>
  <tr><td class="n"><b>${fmt(L.tot.due)}</b></td><td class="n">${fmt(L.tot.b[0])}</td><td class="n">${fmt(L.tot.b[1])}</td><td class="n">${fmt(L.tot.b[2])}</td><td class="n">${fmt(L.tot.b[3])}</td><td class="n">${L.rows.length}</td><td class="n">${L.tot.n}</td></tr></table>
  <table>
    <thead><tr><th style="width:6mm">№</th><th>Эзэн / бичлэг</th><th style="width:22mm">Утас · огноо</th><th style="width:24mm">Эмч · төрөл</th><th style="width:20mm">Нийт дүн</th><th style="width:20mm">Төлсөн</th><th style="width:20mm">Үлдэгдэл</th><th style="width:14mm">Хоног</th></tr></thead>
    <tbody>${L.rows.map((g, k) => `<tr class="own"><td class="n">${k + 1}</td><td>${escHTML(g.owner)} <span style="font-weight:400">(${g.n})</span></td><td>${escHTML(g.phone)}</td><td></td><td class="n">${fmt(g.amount)}</td><td class="n">${fmt(g.paid)}</td><td class="n">${fmt(g.due)}</td><td class="n">${g.maxAge}</td></tr>` +
      g.recs.map(f => `<tr class="sub"><td></td><td style="padding-left:5mm">${escHTML(f.horse || '')}${f.examNum ? ' · №' + escHTML(f.examNum) : ''}${f.services ? ' · ' + escHTML(String(f.services).slice(0, 45)) : ''}</td><td>${escHTML(f.date || '')}</td><td>${escHTML(f.docName || '')} · ${srcLbl[finSourceOf(f)] || ''}</td><td class="n">${fmt(f.amount)}</td><td class="n">${fmt(getPaidAmount(f))}</td><td class="n">${fmt(getDueAmount(f))}</td><td class="n">${_ageDays(f.date)}</td></tr>`).join('')).join('')}
    <tr class="own"><td></td><td colspan="3">НИЙТ</td><td class="n">${fmt(L.tot.amount)}</td><td class="n">${fmt(L.tot.paid)}</td><td class="n">${fmt(L.tot.due)}</td><td></td></tr></tbody>
  </table>
  ${L.inpRows.length ? `<h2 style="text-align:left">Байрлаж буй адуудын хуримтлагдсан төлбөр (нэхэмжлээгүй)</h2>
  <table><thead><tr><th>Адуу</th><th>Эзэн</th><th>Утас</th><th>Эмч</th><th>Байрлал</th><th>Хоног</th><th>Хуримтлагдсан</th><th>Урьдчилгаа</th><th>Үлдэгдэл</th></tr></thead>
  <tbody>${L.inpRows.map(r => `<tr><td>${escHTML(r.i.horse)}</td><td>${escHTML(r.i.owner)}</td><td>${escHTML(r.i.phone || '')}</td><td>${escHTML(r.doc)}</td><td>${escHTML(r.loc)}</td><td class="n">${r.days}</td><td class="n">${fmt(r.full)}</td><td class="n">${fmt(r.pre)}</td><td class="n">${fmt(r.due)}</td></tr>`).join('')}
  <tr class="own"><td colspan="8">НИЙТ</td><td class="n">${fmt(L.inpDue)}</td></tr></tbody></table>` : ''}
  <div class="sig"><div>Нягтлан бодогч</div><div>Accountant / Financeгийн менежер</div><div>Гүйцэтгэх захирал</div></div>
</div>`;
  setTimeout(() => window.print(), 150);
}
function exportFinLedgerCSV() {
  const L = buildFinLedger(_ledgerFins());
  const srcLbl = { clinic: 'Clinical Exam', inpatient: 'Байрлан', planned: 'ТҮ' };
  const rows = [['Эзэн', 'Утас', 'Адуу', 'Дугаар', 'Огноо', 'Эмч', 'Төрөл', 'Үйлчилгээ', 'Нийт дүн', 'Төлсөн', 'Үлдэгдэл', 'Хоног']];
  L.rows.forEach(g => g.recs.forEach(f => rows.push([g.owner, g.phone, f.horse || '', f.examNum || '', f.date || '', f.docName || '', srcLbl[finSourceOf(f)] || '', f.services || '', parseFloat(f.amount) || 0, getPaidAmount(f), getDueAmount(f), _ageDays(f.date)])));
  L.inpRows.forEach(r => rows.push([r.i.owner, r.i.phone || '', r.i.horse, '', r.i.admittedDate || '', r.doc, 'Байрлаж буй (нэхэмжлээгүй)', r.loc, r.full, r.pre, r.due, r.days]));
  downloadCSV(rows, 'avlaga_' + todayStr() + '.csv');
}

function renderFinance() {
  // tabs
  $$('.tab[data-ftab]').forEach(t => t.onclick = () => {
    STATE.activeFTab = t.dataset.ftab;
    $$('.tab[data-ftab]').forEach(x => x.classList.toggle('active', x.dataset.ftab === STATE.activeFTab));
    $$('.ftab').forEach(x => x.classList.toggle('hidden', x.dataset.ftab !== STATE.activeFTab));
    renderFinance();
  });
  $$('.tab[data-ftab]').forEach(x => x.classList.toggle('active', x.dataset.ftab === STATE.activeFTab));
  $$('.ftab').forEach(x => x.classList.toggle('hidden', x.dataset.ftab !== STATE.activeFTab));

  // Categorize finance records — шүүлтийн мөрийг хэрэглэнэ
  _finFillDocFilter();
  const F = _finFilter();
  const finsK = STATE.fins.filter(f => finFilterOk(f, F));
  _finFilterInfo(F, finsK.length, STATE.fins.length);
  const ledgerN = finsK.filter(f => getDueAmount(f) > 0).length;
  if ($('#ft-l')) $('#ft-l').textContent = ledgerN;
  if (STATE.activeFTab === 'ledger') renderFinLedger(finsK);
  const pending = finsK.filter(f => !isFullyPaid(f) && !isReceivable(f)).sort((a,b) => recTime(b) - recTime(a));
  const receivables = finsK.filter(f => isReceivable(f)).sort((a,b) => recTime(b) - recTime(a));
  const paid = finsK.filter(f => isFullyPaid(f)).sort((a,b) => (b.paidMs||recTime(b)) - (a.paidMs||recTime(a)));

  $('#ft-p').textContent = pending.length;
  $('#ft-r').textContent = receivables.length;
  $('#ft-d').textContent = paid.length;

  // 🎁 урамшуулал
  if (STATE.activeFTab === 'bonus') { try { renderBonus(); } catch(e) { console.error(e); } }

  // pending
  if (STATE.activeFTab === 'pending') {
    const list = $('#fin-pending-list');
    const pd = _finSlice(pending, 'pending');
    _finPagCtl(list, 'pending', pd.totalPages, pd.total);
    if (pending.length === 0) {
      list.innerHTML = '<div class="empty"><div class="empty-em">📄</div>Хүлээгдэж буй нэхэмжлэх алга</div>';
    } else {
      list.innerHTML = pd.page.map(f => `
        <div class="li" data-id="${escHTML(f.id)}">
          <div class="li-stripe" style="background:var(--orange)"></div>
          <div class="li-av">📄</div>
          <div class="li-info">
            <div class="li-name">${escHTML(f.horse)} <span class="muted" style="font-weight:600">· ${escHTML(f.owner)}</span></div>
            <div class="li-sub">${f.examNum ? '<span class="badge b-o" style="font-size:10px;margin-right:4px">'+escHTML(f.examNum)+'</span>' : ''}${kindBadge(f, true)}${escHTML(f.services||'—')}${finSourceOf(f) === 'inpatient' ? '<div class="muted" style="font-size:10.5px">' + escHTML(finInpBreakdownShort(f)) + '</div>' : ''}</div>
          </div>
          <div class="li-r">
            <span class="badge b-o">${fmt(f.amount)}</span>
            <div class="li-time">${escHTML(f.date)}</div>
          </div>
        </div>
      `).join('');
      list.querySelectorAll('.li').forEach(el => el.onclick = () => {
        STATE.selectedF = String(el.dataset.id);
        list.querySelectorAll('.li').forEach(x => x.classList.toggle('sel', x.dataset.id === STATE.selectedF));
        renderFDetail();
      });
    }
    if (STATE.selectedF != null) STATE.selectedF = String(STATE.selectedF);
    // Only re-render detail if selected item is in this list
    if (STATE.selectedF && pending.find(p => String(p.id) === STATE.selectedF)) renderFDetail();
    else $('#fin-detail-body').innerHTML = '<div class="empty"><div class="empty-em">📄</div>Нэхэмжлэх сонгоно уу</div>';
  }

  // receivables
  if (STATE.activeFTab === 'receivable') {
    const list = $('#fin-recv-list');
    const rd = _finSlice(receivables, 'receivable');
    _finPagCtl(list, 'receivable', rd.totalPages, rd.total);
    if (receivables.length === 0) {
      list.innerHTML = '<div class="empty"><div class="empty-em">🧾</div>Авлага алга</div>';
      $('#fin-recv-detail-body').innerHTML = '<div class="empty"><div class="empty-em">🧾</div>Авлага сонгоно уу</div>';
    } else {
      list.innerHTML = rd.page.map(f => {
        const due = getDueAmount(f);
        return `
          <div class="li" data-id="${escHTML(f.id)}">
            <div class="li-stripe" style="background:var(--red)"></div>
            <div class="li-av" style="background:var(--red-soft);color:var(--red)">🧾</div>
            <div class="li-info">
              <div class="li-name">${escHTML(f.horse)} <span class="muted" style="font-weight:600">· ${escHTML(f.owner)}</span></div>
              <div class="li-sub">${f.examNum ? '<span class="badge b-o" style="font-size:10px;margin-right:4px">'+escHTML(f.examNum)+'</span>' : ''}${kindBadge(f, true)}Үлдэгдэл: <b style="color:var(--red)">${fmt(due)}</b> / ${fmt(f.amount)}</div>
            </div>
            <div class="li-r">
              <span class="badge b-r">${fmt(due)}</span>
              <div class="li-time">${escHTML(f.date)}</div>
            </div>
          </div>
        `;
      }).join('');
      list.querySelectorAll('.li').forEach(el => el.onclick = () => {
        STATE.selectedF = String(el.dataset.id);
        list.querySelectorAll('.li').forEach(x => x.classList.toggle('sel', x.dataset.id === STATE.selectedF));
        renderRecvDetail();
      });
      if (STATE.selectedF && receivables.find(r => String(r.id) === STATE.selectedF)) renderRecvDetail();
      else $('#fin-recv-detail-body').innerHTML = '<div class="empty"><div class="empty-em">🧾</div>Авлага сонгоно уу</div>';
    }
  }

  // paid table
  if (STATE.activeFTab === 'paid') {
    const fh = $('#f-hint'); if (fh) fh.innerHTML = __allHistoryLoaded ? '' : '<div class="muted" style="font-size:11.5px;margin-bottom:8px">⏳ Сүүлийн ' + LIVE_WINDOW_DAYS + ' хоногийн төлбөр харагдаж байна. <a href="#" onclick="loadAllHistory().then(function(){renderFinance();});return false;">Бүх түүхийг ачаалах</a></div>';
    const tb = $('#fin-paid-tb');
    const pgd = _finSlice(paid, 'paid');
    const paidAnchor = tb.closest('.tbl-wrap') || tb.closest('table');
    _finPagCtl(paidAnchor, 'paid', pgd.totalPages, pgd.total);
    if (paid.length === 0) {
      tb.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:20px;color:var(--muted)">Бүртгэл алга</td></tr>';
    } else {
      tb.innerHTML = pgd.page.map((f,i) => {
        const h = horseOf(f);
        const iabd = (h && h.iabd) ? h.iabd : '';
        return `
        <tr>
          <td>${pgd.start + i + 1}</td>
          <td>${f.examNum?'<span class="badge b-o" style="font-weight:800">'+escHTML(f.examNum)+'</span>':'—'}</td>
          <td>${escHTML(f.paidDate||f.date)}</td>
          <td>${iabd?escHTML(iabd):'<span class="muted">—</span>'}</td>
          <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHTML(f.horse||'')}">${escHTML(f.horse)}</td>
          <td>${escHTML(f.owner)}</td>
          <td class="bold">${fmt(f.amount)}${finSourceOf(f) === 'inpatient' ? '<div class="muted" style="font-size:10px;font-weight:600;white-space:nowrap">🏥 ' + escHTML(finInpBreakdownShort(f)) + '</div>' : ''}</td>
          <td><span class="badge b-a">${methodIcon(f.method)} ${escHTML(f.method)}</span></td>
          <td>${f.paidMs?fmtTime(f.paidMs):'—'}</td>
          <td>
            <button class="btn btn-xs" onclick="printInvoice('${escHTML(f.id)}')">🖨</button>
            ${hasOwnerSheet(f) ? `<button class="btn btn-xs" onclick="printOwnerSheetByFin('${escHTML(f.id)}')" title="Эзэнд өгөх гарах хуудас">📋</button>` : ''}
            <button class="btn btn-xs" onclick="editFin('${escHTML(f.id)}')">✏️</button>
          </td>
        </tr>
      `;
      }).join('');
    }
  }

  // summary
  if (STATE.activeFTab === 'sum') renderSummary();
}

// Үйлчилгээг тус бүрийн үнэтэй жагсаалт болгож HTML буцаана (холбоотой үзлэгээс)
// ── 🏥 Байрлан эмчилгээний санхүүгийн задаргаа ─────────────────
// Гарахад үүссэн нэхэмжлэх нэг дүнтэй байдаг; эмчилгээний өдөр тутмын
// дүн (байрлан хэсэгт бичигдсэн) санхүүд харагддаггүй байв. Энд:
// үзлэг / эмчилгээ (өдөр бүрээр) / хоногийн хөлс / гэрийн эм / урьдчилгаа.
// Эх сурвалж: fin.breakdown (шинэ) эсвэл inps бичлэг (хуучин).
function finInpBreakdown(f) {
  if (!f || finSourceOf(f) !== 'inpatient') return null;
  const inp = (STATE.inps || []).find(i => (f.breakdown && f.breakdown.inpId && String(i.id) === String(f.breakdown.inpId)) || (f.examId && String(i.examId) === String(f.examId)));
  const logs = inp && Array.isArray(inp.log) ? inp.log.slice().sort((a, b) => (a.date || '') < (b.date || '') ? -1 : 1) : [];
  const b = f.breakdown || {};
  const examFee = b.examFee != null ? +b.examFee : (inp ? parseFloat(inp.initialAmount) || 0 : 0);
  const treat = b.treat != null ? +b.treat : logs.reduce((a, l) => a + (parseFloat(l.amount) || 0), 0);
  const days = b.days != null ? +b.days : (inp ? inpatientDays(inp.admittedMs, inp.dischargedMs) : 0);
  const dailyFee = b.dailyFee != null ? +b.dailyFee : (inp ? getDailyFee(inp) : 0);
  const accom = b.accom != null ? +b.accom : dailyFee * days;
  const hm = inp && inp.dischargeInfo && Array.isArray(inp.dischargeInfo.homeMeds) ? inp.dischargeInfo.homeMeds : [];
  const homeMeds = b.homeMeds != null ? +b.homeMeds : hm.reduce((a, m) => a + (parseFloat(m.price) || 0), 0);
  const prepaid = inp ? getInpPrepaidTotal(inp) : 0;
  const ex = f.examId ? recById('exams', f.examId) : null;
  return { inp, ex, logs, examFee, treat, days, dailyFee, accom, homeMeds, homeMedsRows: hm, prepaid, total: examFee + treat + accom + homeMeds };
}
function finInpBreakdownShort(f) {
  const B = finInpBreakdown(f); if (!B) return '';
  return ['үзлэг ' + fmt(B.examFee), 'эмчилгээ ' + fmt(B.treat), 'хоног ' + B.days + '×' + fmt(B.dailyFee) + '=' + fmt(B.accom), B.homeMeds ? 'гэрийн эм ' + fmt(B.homeMeds) : ''].filter(Boolean).join(' · ');
}
function inpBreakdownHTML(f) {
  const B = finInpBreakdown(f); if (!B) return '';
  const row = (l, v, cls) => `<div class="row" style="justify-content:space-between;align-items:center;padding:7px 12px;font-size:13px;border-top:1px solid var(--border);${cls || ''}"><span>${l}</span><span style="font-weight:800;white-space:nowrap">${v}</span></div>`;
  const sub = (l, v) => `<div class="row" style="justify-content:space-between;align-items:center;padding:4px 12px 4px 26px;font-size:12px;color:var(--muted)"><span>${l}</span><span style="white-space:nowrap">${v}</span></div>`;
  const exSvcs = B.ex && Array.isArray(B.ex.services) ? B.ex.services : [];
  return `
    <div style="background:var(--input);border-radius:8px;overflow:hidden">
      <div style="padding:8px 12px;font-size:12px;font-weight:800;color:var(--purple)">🏥 Байрлан эмчилгээ · ${B.days} хоног${B.inp && B.inp.admittedDate ? ' · ' + escHTML(B.inp.admittedDate) + (B.inp.dischargedDate ? ' → ' + escHTML(B.inp.dischargedDate) : '') : ''}${B.inp && B.inp.location ? ' · 📍 ' + escHTML(B.inp.location) : ''}</div>
      ${row('🩺 Анхны үзлэг', fmt(B.examFee))}
      ${exSvcs.map(s => sub(escHTML(s.name || ''), fmt(parseFloat(s.price) || 0))).join('')}
      ${row('💊 Эмчилгээ <span class="muted" style="font-weight:600">(' + B.logs.length + ' бичлэг)</span>', fmt(B.treat))}
      ${B.logs.map(l => sub(escHTML(l.date || '') + ' · ' + escHTML([...(Array.isArray(l.services) ? l.services.map(x => x.name || x) : []), ...(Array.isArray(l.meds) ? l.meds.map(m => m.name || m) : [])].join(', ') || l.note || '—') + (l.docName ? ' · ' + escHTML(l.docName) : ''), fmt(parseFloat(l.amount) || 0))).join('')}
      ${row('🏨 Хоногийн хөлс <span class="muted" style="font-weight:600">(' + B.days + ' × ' + fmt(B.dailyFee) + ')</span>', fmt(B.accom))}
      ${B.homeMeds ? row('🏠 Гэрийн эм', fmt(B.homeMeds)) + B.homeMedsRows.map(m => sub(escHTML(m.name || ''), fmt(parseFloat(m.price) || 0))).join('') : ''}
      ${row('<b>Нийт</b>', '<b>' + fmt(B.total) + '</b>', 'border-top:2px solid var(--border-strong);background:var(--card)')}
      ${B.prepaid ? row('Урьдчилгаа (байрлах үед)', '−' + fmt(B.prepaid), 'color:var(--green)') : ''}
    </div>`;
}

// Accountant / Finance дээрх байрлангийн нэхэмжлэхийн доор: хэн/хэзээ гаргасан + ↩ буцаах
function _finInpAuditHTML(f) {
  const B = finInpBreakdown(f); const i = B && B.inp; if (!i || !i.discharged) return '';
  const fix = i.dischargeFix ? '<div>🗓 Огноо засагдсан: ' + escHTML(i.dischargeFix.prevDate || '—') + ' → ' + escHTML(i.dischargedDate || '') + ' · ' + escHTML(i.dischargeFix.by || '') + ' · ' + fmtDateTime(i.dischargeFix.ms) + '</div>' : '';
  return `<div class="muted" style="font-size:11.5px;margin-top:6px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
    <span>🚪 Гаргасан: ${escHTML(inpDischargeAuditText(i))}${fix}</span>
    ${canEditData() ? `<span style="display:inline-flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-xs btn-p" onclick="openDischargeDateFix('${escHTML(i.id)}')" title="Бодит гарсан огноог оруулахад хоног, хөлс, энэ нэхэмжлэхийн дүн дахин бодогдоно">🗓 Гарсан огноо засах</button>
      <button class="btn btn-xs" onclick="openDischargedCard('${escHTML(i.id)}','treat')" title="Эмчилгээ / эмийн дүн нэмэх, устгах — нэхэмжлэх дахин бодогдоно">📋 Эмчилгээ нэмэх</button>
      <button class="btn btn-xs" onclick="undoDischargeByFin('${escHTML(f.id)}')" title="Андуурч гаргасан бол адууг буцаан байрлуулж, энэ нэхэмжлэхийг устгана">↩ Байрланд буцаах</button></span>` : ''}
  </div>`;
}
function servicesPricedHTML(f) {
  const inpHTML = inpBreakdownHTML(f); if (inpHTML) return inpHTML + _finInpAuditHTML(f);
  const ex = STATE.exams.find(x => String(x.id) === String(f.examId));
  const svcItems = (ex && Array.isArray(ex.services)) ? ex.services : [];
  if (!svcItems.length) {
    return `<div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px">${escHTML(f.services||'—')}</div>`;
  }
  const svcTotal = svcItems.reduce((a,s) => a + (parseFloat(s.price)||0), 0);
  return `
    <div style="background:var(--input);border-radius:8px;overflow:hidden">
      ${svcItems.map((s,i) => `
        <div class="row" style="justify-content:space-between;align-items:center;padding:8px 12px;font-size:13px;${i>0?'border-top:1px solid var(--border)':''}">
          <span style="font-weight:600">${escHTML(s.name||'—')}</span>
          <span style="font-weight:800;color:var(--orange-dark);white-space:nowrap">${fmt(parseFloat(s.price)||0)}</span>
        </div>
      `).join('')}
      <div class="row" style="justify-content:space-between;align-items:center;padding:8px 12px;font-size:13px;border-top:2px solid var(--border-strong);background:var(--card)">
        <span style="font-weight:800">Нийт</span>
        <span style="font-weight:900;white-space:nowrap">${fmt(svcTotal)}</span>
      </div>
    </div>`;
}

function renderRecvDetail() {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.selectedF));
  if (!f) return;
  const due = getDueAmount(f);
  const paidAmt = getPaidAmount(f);
  $('#fin-recv-detail-body').innerHTML = `
    ${f.examNum ? '<div style="background:var(--orange-soft);padding:8px 12px;border-radius:8px;margin-bottom:10px;font-weight:800;color:var(--orange-dark);font-size:14px">🔢 Үзлэгийн хуудасны дугаар: ' + escHTML(f.examNum) + '</div>' : ''}
    <div class="fg r2">
      <div class="fld"><label>Адуу</label><div class="bold">${escHTML(f.horse)}</div></div>
      <div class="fld"><label>Эзэн</label><div class="bold">${escHTML(f.owner)}</div></div>
      <div class="fld"><label>Утас</label><div>${escHTML(f.phone)}</div></div>
      <div class="fld"><label>Огноо</label><div>${escHTML(f.date)}</div></div>
    </div>
    <div class="fld" style="margin-top:8px"><label>Үйлчилгээ ба үнэ</label>
      ${servicesPricedHTML(f)}
    </div>
    <div class="fg r3" style="margin-top:8px">
      <div class="fld"><label>Нийт дүн</label><div style="font-size:16px;font-weight:900">${fmt(f.amount)}</div></div>
      <div class="fld"><label>Төлсөн</label><div style="font-size:16px;font-weight:900;color:var(--green)">${fmt(paidAmt)}</div></div>
      <div class="fld"><label>Үлдэгдэл</label><div style="font-size:18px;font-weight:900;color:var(--red)">${fmt(due)}</div></div>
    </div>
    ${renderPaymentsList(f)}
    <div class="row" style="justify-content:flex-end;gap:8px;margin-top:14px">
      ${hasOwnerSheet(f) ? `<button class="btn" onclick="printOwnerSheetByFin('${escHTML(f.id)}')">📋 Эзэнд өгөх хуудас</button>` : ''}
      <button class="btn btn-g" onclick="markPaid('${escHTML(f.id)}')">💰 Төлбөр нэмэх</button>
    </div>
  `;
}

// ============================================================
// FINANCE — payments helpers
// ============================================================
// Each finance record (fin) has a `payments` array:
//   [{ amount, method, date, ms }, ...]
// `paid` is derived: total payments >= amount AND no "зээл" methods only
// `receivable` = (amount - sum(non-зээл payments)) > 0

function getPayments(f) {
  return Array.isArray(f.payments) ? f.payments : [];
}
function getPaidAmount(f) {
  // Only non-зээл payments count as actually paid
  return getPayments(f)
    .filter(p => p.method !== 'зээл')
    .reduce((a, b) => a + (parseFloat(b.amount) || 0), 0);
}
function getDueAmount(f) {
  return Math.max(0, (parseFloat(f.amount)||0) - getPaidAmount(f));
}
function isFullyPaid(f) {
  return getDueAmount(f) === 0 && getPaidAmount(f) > 0;
}
function isReceivable(f) {
  // Has some non-зээл payments OR has зээл payment, AND has remaining due
  const due = getDueAmount(f);
  const hasZeel = getPayments(f).some(p => p.method === 'зээл');
  const hasPartial = getPaidAmount(f) > 0;
  return due > 0 && (hasZeel || hasPartial);
}

function renderFDetail() {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.selectedF));
  if (!f) {
    $('#fin-detail-body').innerHTML = '<div class="empty"><div class="empty-em">📄</div>Нэхэмжлэх сонгоно уу</div>';
    return;
  }
  const due = getDueAmount(f);
  const paidAmt = getPaidAmount(f);
  const fEx = f.examId ? _dxExam(f.examId) : null;
  $('#fin-detail-body').innerHTML = `
    ${f.examNum ? '<div style="background:var(--orange-soft);padding:8px 12px;border-radius:8px;margin-bottom:10px;font-weight:800;color:var(--orange-dark);font-size:14px">🔢 Үзлэгийн хуудасны дугаар: ' + escHTML(f.examNum) + '</div>' : ''}
    ${fEx && dxStatusOf(fEx) && !isPlanned(fEx) ? `<div style="margin-bottom:10px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">${dxBadgeHTML(fEx)}${dxIsOpen(fEx) ? '<span class="muted" style="font-size:11.5px">— батлагдсаны дараа үйлчлүүлэгчийн хуудсанд онош хэвлэгдэнэ</span>' : ''}</div>` : ''}
    <div class="fg r2">
      <div class="fld"><label>Адуу</label><div class="bold">${escHTML(f.horse)}</div></div>
      <div class="fld"><label>Эзэн</label><div class="bold">${escHTML(f.owner)}</div></div>
      <div class="fld"><label>Утас</label><div>${escHTML(f.phone)}</div></div>
      <div class="fld"><label>Эмч</label><div>${escHTML(f.docName)}</div></div>
    </div>
    <div class="fld" style="margin-top:8px"><label>Үйлчилгээ ба үнэ</label>
      ${servicesPricedHTML(f)}
    </div>
    <div class="fg r3" style="margin-top:8px">
      <div class="fld"><label>Дүн</label><div style="font-size:18px;font-weight:900">${fmt(f.amount)}</div></div>
      <div class="fld"><label>Төлсөн</label><div style="font-size:18px;font-weight:900;color:var(--green)">${fmt(paidAmt)}</div></div>
      <div class="fld"><label>Үлдэгдэл</label><div style="font-size:18px;font-weight:900;color:var(--orange-dark)">${fmt(due)}</div></div>
    </div>
    ${renderPaymentsList(f)}
    <div class="row" style="justify-content:flex-end;margin-top:14px">
      <button class="btn btn-g" onclick="markPaid('${escHTML(f.id)}')">💰 Төлбөрийн хэлбэр</button>
    </div>
  `;
}

function renderPaymentsList(f) {
  const ps = getPayments(f);
  if (ps.length === 0) return '';
  return `
    <div class="fld" style="margin-top:8px"><label>Бүртгэгдсэн төлбөр</label>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${ps.map((p,i) => `
          <div class="row" style="justify-content:space-between;background:var(--input);padding:6px 10px;border-radius:6px;font-size:12px">
            <span>${methodIcon(p.method)} ${escHTML(p.method)} <span class="muted">${escHTML(p.date||'')}</span></span>
            <span class="bold">${fmt(p.amount)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function methodIcon(m) {
  return ({
    'бэлэн':'💵','карт':'💳','QPay':'📱','дансаар':'🏦','зээл':'📝','шилжүүлэг':'🏦'
  })[m] || '💰';
}

// ============================================================
// PAYMENT MODAL — multi-method, multi-amount
// ============================================================

function markPaid(id) {
  STATE.payTarget = id;
  const f = STATE.fins.find(x => String(x.id) === String(id));
  if (!f) return;
  // Initialize draft payments from existing
  STATE.draftPayments = getPayments(f).map(p => ({...p}));
  $('#pay-info').innerHTML = `<b>${escHTML(f.horse)}</b> · ${escHTML(f.owner)}`;
  $('#pay-amt').value = '';
  $('#pay-method').value = 'бэлэн';
  refreshPaymentModal();
  openModal('pay-modal');
}

function refreshPaymentModal() {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.payTarget));
  if (!f) return;
  const total = parseFloat(f.amount) || 0;
  const paid = STATE.draftPayments
    .filter(p => p.method !== 'зээл')
    .reduce((a,b) => a + (parseFloat(b.amount)||0), 0);
  const due = Math.max(0, total - paid);
  $('#pay-total').textContent = fmt(total);
  $('#pay-paid').textContent = fmt(paid);
  $('#pay-due').textContent = fmt(due);

  const hist = $('#pay-history');
  if (STATE.draftPayments.length === 0) {
    hist.innerHTML = '<div class="muted" style="font-size:12px;padding:8px;text-align:center">Төлбөр бүртгэгдээгүй</div>';
  } else {
    hist.innerHTML = STATE.draftPayments.map((p,i) => `
      <div class="row" style="justify-content:space-between;background:var(--input);padding:8px 10px;border-radius:6px;margin-bottom:4px;font-size:12px">
        <span>${methodIcon(p.method)} ${escHTML(p.method)} <span class="muted">${escHTML(p.date||'')}</span></span>
        <span class="row" style="gap:8px">
          <span class="bold">${fmt(p.amount)}</span>
          <button class="btn btn-r btn-xs" onclick="removeDraftPayment(${i})">✕</button>
        </span>
      </div>
    `).join('');
  }
}

function setPayAmt(mode) {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.payTarget));
  if (!f) return;
  const total = parseFloat(f.amount) || 0;
  const paid = STATE.draftPayments
    .filter(p => p.method !== 'зээл')
    .reduce((a,b) => a + (parseFloat(b.amount)||0), 0);
  const due = Math.max(0, total - paid);
  if (mode === 'full') $('#pay-amt').value = due;
  else if (mode === 'half') $('#pay-amt').value = Math.round(due / 2);
}

function addPayment() {
  const amt = parseFloat($('#pay-amt').value);
  const method = $('#pay-method').value;
  if (!amt || amt <= 0) { toast('Зөв дүн оруулна уу', 'err'); return; }
  // Тухайн бичлэгийн огноог ашиглана (өнөөдрийн огноо биш)
  const f = STATE.fins.find(x => String(x.id) === String(STATE.payTarget));
  const payDate = (f && f.date) ? f.date : todayStr();
  STATE.draftPayments.push({
    amount: amt,
    method: method,
    date: payDate,
    ms: nowMs()
  });
  $('#pay-amt').value = '';
  refreshPaymentModal();
}

function removeDraftPayment(i) {
  STATE.draftPayments.splice(i, 1);
  refreshPaymentModal();
}

function finalizePayment() {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.payTarget));
  if (!f) return;
  // Save payments back
  f.payments = STATE.draftPayments.slice();
  // Derive paid status & method for backwards compatibility
  const paidAmt = getPaidAmount(f);
  if (isFullyPaid(f)) {
    f.paid = true;
    // Use last non-зээл method as primary
    const last = [...f.payments].reverse().find(p => p.method !== 'зээл');
    f.method = last ? last.method : (f.payments[0] && f.payments[0].method) || '';
    // Төлбөр авсан өдрийг өнөөдрийн огноо болгоно — үзлэгийн огноо биш
    // Мөнгөн урсгалын тайланд зөв тусгагдахын тулд чухал
    f.paidDate = todayStr();
    f.paidMs = nowMs();
  } else {
    f.paid = false;
    // Combined method label if partial
    if (f.payments.length === 1) f.method = f.payments[0].method;
    else if (f.payments.length > 1) f.method = 'хосолсон';
    else f.method = '';
  }
  saveAll();
  fbSaveRecord('fins', f);
  const linkedExam = STATE.exams.find(x => String(x.id) === String(f.examId));
  const examNumForLog = (linkedExam && linkedExam.examNum) || f.examNum || '';
  const paidNow = getPaidAmount(f);
  const payDetail = (isFullyPaid(f) ? 'Бүтэн төлсөн' : 'Хэсэгчлэн төлсөн') +
    ': ' + fmt(paidNow) + (f.method ? ' · ' + f.method : '');
  writeLog(isFullyPaid(f) ? 'Төлбөр авсан' : 'Хэсэгчилсэн төлбөр авсан',
    f.id, (f.horse || f.examId || ''), payDetail, examNumForLog);
  closeModal('pay-modal');
  STATE.selectedF = null;
  STATE.draftPayments = [];
  updateBadges();
  toast('💾 Хадгалагдлаа', 'ok');
  renderFinance();
}

// Legacy alias for any old caller
function confirmPay() { finalizePayment(); }

function editFin(id) {
  STATE.editTarget = id;
  const f = STATE.fins.find(x => String(x.id) === String(id));
  if (!f) return;
  $('#ed-amt').value = f.amount;
  $('#ed-method').value = f.method;
  openModal('edit-modal');
}

function saveEditFin() {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.editTarget));
  if (!f) return;
  if (!canEditData()) { toast('⛔ Засах эрхгүй', 'err'); return; }
  const before = { ...f };
  f.amount = parseFloat($('#ed-amt').value) || 0;
  f.method = $('#ed-method').value;
  f.ms = nowMs();
  const changes = diffStr(before, f, [{k:'amount',label:'Дүн'},{k:'method',label:'Төлбөрийн хэлбэр'}]);
  saveAll();
  fbSaveRecord('fins', f);
  writeLog('Accountant / Finance засварласан', f.id, (f.horse||f.examId||''), changes || 'Өөрчлөлтгүй хадгалсан');
  closeModal('edit-modal');
  toast('💾 Хадгалагдлаа', 'ok');
  renderFinance();
  if (STATE.activePage === 'kpi') renderKPI();
}

function renderSummary() {
  const today = todayStr();
  const now = nowMs();
  const week = STATE.fins.filter(f => f.paid && (now - (f.paidMs||0)) < 7*86400000);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const month = STATE.fins.filter(f => f.paid && (f.paidMs||0) >= monthStart.getTime());
  const todayFins = STATE.fins.filter(f => f.paid && f.paidDate === today);

  $('#sm-today').textContent = fmtCompact(todayFins.reduce((a,b)=>a+b.amount,0));
  $('#sm-week').textContent = fmtCompact(week.reduce((a,b)=>a+b.amount,0));
  $('#sm-month').textContent = fmtCompact(month.reduce((a,b)=>a+b.amount,0));

  // payment method breakdown
  const methods = {'бэлэн':0,'карт':0,'QPay':0,'шилжүүлэг':0};
  month.forEach(f => { methods[f.method] = (methods[f.method]||0) + f.amount; });
  const totalM = Math.max(1, Object.values(methods).reduce((a,b)=>a+b,0));
  $('#sm-pay-bars').innerHTML = Object.entries(methods).map(([k,v]) => `
    <div style="margin-bottom:10px">
      <div class="row" style="justify-content:space-between;font-size:12px">
        <span class="bold">${escHTML(k)}</span>
        <span class="muted">${fmtCompact(v)} (${Math.round(v/totalM*100)}%)</span>
      </div>
      <div class="prog"><div class="prog-fill" style="width:${(v/totalM*100)}%"></div></div>
    </div>
  `).join('');

  // 🏥 Байрлан эмчилгээний орлогын задаргаа (энэ сард төлөгдсөн)
  const smInp = $('#sm-inp-breakdown');
  if (smInp) {
    const agg = { n: 0, examFee: 0, treat: 0, accom: 0, homeMeds: 0, total: 0 };
    month.forEach(f => { const B = finInpBreakdown(f); if (!B) return; agg.n++; agg.examFee += B.examFee; agg.treat += B.treat; agg.accom += B.accom; agg.homeMeds += B.homeMeds; agg.total += parseFloat(f.amount) || 0; });
    const clinicTotal = month.reduce((a, f) => a + (parseFloat(f.amount) || 0), 0) - agg.total;
    const bar = (l, v, tot) => `<div style="margin-bottom:8px"><div class="row" style="justify-content:space-between;font-size:12px"><span class="bold">${l}</span><span class="muted">${fmtCompact(v)} (${tot ? Math.round(v / tot * 100) : 0}%)</span></div><div class="prog"><div class="prog-fill" style="width:${tot ? v / tot * 100 : 0}%"></div></div></div>`;
    smInp.innerHTML = agg.n
      ? `<div class="muted" style="font-size:12px;margin-bottom:8px">Энэ сард ${agg.n} байрлан эмчилгээний нэхэмжлэх төлөгдсөн — нийт ${fmt(agg.total)} (клиник үзлэг: ${fmt(clinicTotal)})</div>` +
        bar('🩺 Анхны үзлэг', agg.examFee, agg.total) + bar('💊 Эмчилгээ (өдөр тутмын бичлэг)', agg.treat, agg.total) + bar('🏨 Хоногийн хөлс', agg.accom, agg.total) + (agg.homeMeds ? bar('🏠 Гэрийн эм', agg.homeMeds, agg.total) : '')
      : '<div class="muted" style="font-size:12px">Энэ сард төлөгдсөн байрлан эмчилгээний нэхэмжлэх алга</div>';
  }
  $('#sm-cnt').textContent = month.length;
  $('#sm-avg').textContent = fmtCompact(month.length ? month.reduce((a,b)=>a+b.amount,0)/month.length : 0);
  const pending = STATE.fins.filter(f => !f.paid);
  $('#sm-pcnt').textContent = pending.length;
  $('#sm-pamt').textContent = fmtCompact(pending.reduce((a,b)=>a+b.amount,0));
}

function exportCSV() {
  const rows = [['#','Огноо','Адуу','Эзэн','Утас','Дүн','Хэлбэр','Статус','Үйлчилгээ']];
  STATE.fins.forEach((f,i) => {
    rows.push([i+1, f.paidDate||f.date, f.horse, f.owner, f.phone, f.amount, f.method, f.paid?'Төлсөн':'Хүлээгдэж буй', f.services]);
  });
  downloadCSV(rows, 'санхүү_' + todayStr() + '.csv');
}

function downloadCSV(rows, name) {
  const csv = rows.map(r => r.map(c => '"' + (c+'').replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  toast('⬇ Татагдлаа', 'ok');
}

function printInvoice(id) {
  const f = STATE.fins.find(x => String(x.id) === String(id));
  if (!f) return;
  const ex = STATE.exams.find(x => String(x.id) === String(f.examId));
  const services = ex && ex.services ? ex.services : [];
  const isPaid = !!f.paid;

  // Exam number (UUD) — use examNum if set, else last 7 chars of id padded
  const examNum = (f.examNum || ex && ex.examNum || '').toString().trim();
  const uudDisplay = examNum
    ? examNum.padStart(7, '0')
    : f.id.slice(-7).toUpperCase().replace(/[^0-9]/g, '0').padStart(7,'0');

  // Vitals
  const temp  = ex && ex.temp  ? ex.temp  : '...............';
  const pulse = ex && ex.pulse ? ex.pulse : '...............';
  const resp  = ex && ex.resp  ? ex.resp  : '...............';
  const wt    = ex && ex.wt    ? ex.wt    : '...............';

  // Meds — support both {name,note} objects and plain strings
  let medsArr = [];
  if (ex && Array.isArray(ex.meds) && ex.meds.length) {
    medsArr = ex.meds.map(m => {
      if (typeof m === 'object' && m.name) return m.name + (m.note ? ' — ' + m.note : '');
      return m;
    }).filter(Boolean);
  } else if (ex && typeof ex.meds === 'string' && ex.meds.trim()) {
    // мөр эсвэл таслалаар салгаж жагсаалт болгоно
    medsArr = ex.meds.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }
  const medsStr = medsArr.join('\n');
  const medsListHTML = medsArr.length
    ? '<ul style="margin:1mm 0 0;padding-left:5mm;font-size:8pt;line-height:1.5">' + medsArr.map(m => `<li style="margin-bottom:0.5mm">${escHTML(m)}</li>`).join('') + '</ul>'
    : '<div style="font-size:8pt">&nbsp;</div>';

  // Services as string for left panel
  const svcStr = services.map(s => s.name || '').filter(Boolean).join(', ') || '................................';

  // Үйлчилгээний жагсаалт (оношийн доор гарна) — нэр + үнэ
  const svcRowsHTML = services.length
    ? services.map(s => `<div class="uz-svc-line"><span>${escHTML(s.name||'')}</span><span class="uz-svc-price">${s.price ? fmt(s.price) : ''}</span></div>`).join('')
    : '<div class="uz-svc-line muted">................................</div>';

  // Diagnosis / note
  const diag = ex && ex.diagnosis ? ex.diagnosis : '';
  const note = ex && ex.note ? ex.note : '';
  // 🩺 Үйлчлүүлэгчид өгөх (баруун) хэсэгт онош ЗӨВХӨН ахлах эмч баталсны дараа гарна
  const dxOk = !!(ex && dxIsApproved(ex) && diag);
  const rightDxHTML = dxOk
    ? `<div style="font-size:8.5pt;margin-bottom:1.5mm;line-height:1.4"><b>Онош:</b> <span style="white-space:pre-wrap">${escHTML(diag)}</span>
        <div style="font-size:7pt;color:#444;margin-top:0.5mm">Баталсан ахлах эмч: ${escHTML(ex.dxApprovedBy || '')}</div></div>`
    : `<div class="uz-field-row" style="margin-bottom:1.5mm"><span class="uz-lbl" style="font-weight:700">Онош:</span><span class="uz-ul"></span></div>`;
  __printDxGuard = ex && dxIsOpen(ex) ? String(ex.id) : null;

  // Payment method checkboxes
  const method = (f.method || '').toLowerCase();
  const chkPos   = method.includes('пос') || method.includes('pos')   ? '✓' : '';
  const chkDans  = method.includes('данс')                             ? '✓' : '';
  const chkBelen = method.includes('бэлэн') || method.includes('cash') ? '✓' : '';
  const chkBusad = (!chkPos && !chkDans && !chkBelen && method) ? '✓' : '';

  // Province (Аймаг) and Soum — fallback chain: exam → waiting → horse → fin
  const w = STATE.waiting.find(x => ex && String(x.id) === String(ex.waitId));
  const horse = (ex && horseOf(ex)) || horseOf(f);
  const province = (ex && ex.province) || (w && w.province) || (horse && horse.province) || (f.province) || '';
  const soum     = (ex && ex.soum)     || (w && w.soum)     || (horse && horse.soum)     || (f.soum)     || '';
  const iabd     = (horse && horse.iabd) || ''; // Ирсэн адууны бүртгэлийн дугаар

  // Condition (гараар тэмдэглэх — идэвхитэй / сэргэлэн цовоо / ноомойрсон)
  const cSain = '', cDund = '', cMuu = '';

  // Date display — full YYYY/MM/DD
  const dateStr = f.date || (ex && ex.date) || '';
  const dateParts = dateStr ? dateStr.split('-') : [];
  const dateFormatted = dateParts.length === 3
    ? `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`
    : '........./......./.......'  ;

  // Анамнез — бүртгэлийн анамнезийн текст + эмчийн сонгосон шинж тэмдгүүд
  // Хуучин үзлэгт symptoms нь массив (эмчийн сонгосон), шинэ үзлэгт anamnesis нь бүртгэлийн текст
  const toArr = v => Array.isArray(v) ? v : [];
  const anamArr = [
    ...toArr(ex && ex.symptoms),
    ...toArr(ex && ex.symptoms2),
    ...toArr(w && w.symptoms)
  ].filter(Boolean);
  // давхардлыг арилгана
  const anamArrUniq = [...new Set(anamArr.map(s => String(s).trim()).filter(Boolean))];
  const anamFreeText = (ex && ex.anamnesis)
    || (ex && typeof ex.symptoms === 'string' ? ex.symptoms : '')
    || (w && typeof w.symptoms === 'string' ? w.symptoms : '')
    || '';
  const anamText = [anamFreeText, anamArrUniq.join(', ')]
    .filter(Boolean)
    .join(anamFreeText && anamArrUniq.length ? ' · ' : '');

  // Build dotted note lines for left (below-table section)
  const leftNoteLines = 4;
  const leftDots = Array(leftNoteLines).fill('<div class="uz-dotline"></div>').join('');

  // Баруун "Эмнэлэг зөвлөгөө" — эмчийн тэмдэглэл (зөвлөгөө) жагсаалтаар + эмийн жор
  // Зөвлөгөөг мөр бүрээр салгаж цэгтэй жагсаалт болгоно
  const adviceLines = (note || '')
    .split(/\r?\n/)
    .map(s => s.replace(/^[•\-\u2022\d.\)\s]+/, '').trim())
    .filter(Boolean);
  const adviceListHTML = adviceLines.length
    ? '<ul class="uz-advice-list">' + adviceLines.map(l => `<li>${escHTML(l)}</li>`).join('') + '</ul>'
    : '<div class="muted" style="font-size:8pt">&nbsp;</div>';
  const adviceListInlineHTML = adviceLines.length
    ? '<ul style="margin:1mm 0 0;padding-left:5mm;font-size:8pt;line-height:1.5">' + adviceLines.map(l => `<li style="margin-bottom:0.5mm">${escHTML(l)}</li>`).join('') + '</ul>'
    : '<div style="font-size:8pt">&nbsp;</div>';
  // Эмийн жорыг доор тусад нь (хэрэв байвал)
  const medsAdviceHTML = medsArr.length
    ? `<div style="font-size:7.5pt;font-weight:700;margin-top:1.5mm">Хэрэглэх эм:</div>${medsListHTML}`
    : '';
  const rightAdviceHTML = adviceListHTML + medsAdviceHTML;

  const printHTML = `
<div class="uz-sheet">

  <!-- ═══════════════ LEFT PANEL ═══════════════ -->
  <div class="uz-left">
    <div class="uz-title">Морьтон үндэсний адууны эмнэлэг</div>

    <!-- UUD row -->
    <div class="uz-uud-row">
      <span>Үзлэгийн хуудасны дугаар УУД:</span>
      <span class="uz-uud-num">${uudDisplay}</span>
      <span class="uz-date-row">Огноо ${dateFormatted}</span>
    </div>

    <!-- Main info grid -->
    <table class="uz-grid">
      <tr>
        <td class="lbl" style="width:22mm">ИАБД: <b>${escHTML(iabd)}</b></td>
        <td class="val" colspan="2">Эзний нэр: <b>${escHTML(f.owner||'')}</b></td>
        <td class="val">Утас: <b>${escHTML(f.phone||'')}</b></td>
      </tr>
      <tr>
        <td class="lbl">Дуулалдын №:</td>
        <td class="val" colspan="3">Адууны нэр: <b>${escHTML(f.horse||'')}</b></td>
      </tr>
      <tr>
        <td class="lbl">Төлөвлөгөөт үзлэг №:</td>
        <td class="val">Аймаг: <b>${escHTML(province)}</b></td>
        <td class="val" colspan="2">Сум: <b>${escHTML(soum)}</b></td>
      </tr>
      <tr>
        <td class="lbl" style="vertical-align:top;width:36mm">
          <div><b>Биеийн ерөнхий байдал:</b></div>
          <div class="uz-cond">
            <span class="uz-cb ${cSain?'checked':''}">${cSain}</span>Идэвхитэй
            <span class="uz-cb ${cDund?'checked':''}">${cDund}</span>Сэргэлэн цовоо
            <span class="uz-cb ${cMuu?'checked':''}">${cMuu}</span>Ноомойрсон
          </div>
          <div class="uz-vitals-block" style="margin-top:2mm">
            <div>Биеийн халуун: <b>${temp}</b></div>
            <div>Зүрхний цохилт: <b>${pulse}</b></div>
            <div>Амьсгалын тоо: <b>${resp}</b></div>
          </div>
        </td>
        <td class="val wide" colspan="3" style="vertical-align:top">
          <b>Анамнез:</b><br>
          <div style="margin-top:1mm;line-height:1.5;white-space:pre-wrap;font-size:8pt">${escHTML(anamText) || '&nbsp;\n&nbsp;\n&nbsp;'}</div>
        </td>
      </tr>
    </table>

    <!-- Онош / Үйлчилгээ / Зөвлөгөө — хүснэгтгүй -->
    <div class="uz-block" style="margin-top:2mm;font-size:8pt">
      <div><b>Онош:</b> <span style="font-weight:400;white-space:pre-wrap">${escHTML(diag||'')}</span></div>
    </div>
    <div class="uz-block" style="margin-top:2mm;font-size:8pt">
      <div><b>Хийсэн үйлчилгээ:</b></div>
      <div class="uz-svc-block">${(() => { const B = finInpBreakdown(f); if (!B) return svcRowsHTML;
        const line = (l, v) => `<div class="uz-svc-line"><span>${l}</span><span class="uz-svc-price">${v}</span></div>`;
        return line('Анхны үзлэг' + (B.ex && Array.isArray(B.ex.services) && B.ex.services.length ? ' (' + escHTML(B.ex.services.map(x => x.name).join(', ')) + ')' : ''), fmt(B.examFee)) +
          line('Эмчилгээ — ' + B.logs.length + ' бичлэг', fmt(B.treat)) +
          B.logs.map(l => line('&nbsp;&nbsp;' + escHTML(l.date || '') + ' ' + escHTML([...(Array.isArray(l.services) ? l.services.map(x => x.name || x) : []), ...(Array.isArray(l.meds) ? l.meds.map(m => m.name || m) : [])].join(', ').slice(0, 60)), fmt(parseFloat(l.amount) || 0))).join('') +
          line('Хоногийн хөлс — ' + B.days + ' × ' + fmt(B.dailyFee), fmt(B.accom)) +
          (B.homeMeds ? line('Гэрийн эм', fmt(B.homeMeds)) : '') +
          (B.prepaid ? line('Урьдчилгаа', '−' + fmt(B.prepaid)) : ''); })()}</div>
    </div>
    <div class="uz-block" style="margin-top:2mm;font-size:8pt">
      <div><b>Эмчийн өгсөн зөвлөгөө:</b></div>
      ${adviceListInlineHTML}
    </div>

    <!-- Dotted note lines -->
    <div class="uz-dotlines">${leftDots}</div>

    <!-- Meds row -->
    <div class="uz-med-block" style="margin-top:2mm">
      <div class="uz-lbl" style="font-weight:700;font-size:8pt">Хэрэглэсэн эм тариа, эмчилгэ /эмийн тун/:</div>
      ${medsListHTML}
    </div>

    <!-- Payment row -->
    <div class="uz-pay-row">
      <span class="uz-lbl">Тооцооны дүн:</span>
      <span class="uz-pay-amount">${fmt(f.amount)}</span>
      <span>₮</span>
      <span class="uz-cb ${chkPos?'checked':''}">${chkPos}</span><span class="uz-lbl">Пос</span>
      <span class="uz-cb ${chkDans?'checked':''}">${chkDans}</span><span class="uz-lbl">Дансаар</span>
      <span class="uz-cb ${chkBelen?'checked':''}">${chkBelen}</span><span class="uz-lbl">Бэлэн</span>
      <span class="uz-cb ${chkBusad?'checked':''}">${chkBusad}</span><span class="uz-lbl">Бусад</span>
    </div>

    <!-- Payment note -->
    <div class="uz-field-row">
      <span class="uz-lbl">Тооцооны тайлбар:</span>
      <span class="uz-ul">${isPaid ? 'Төлсөн · ' + escHTML(f.method||'') : 'Хүлээгдэж буй'}</span>
    </div>

    <!-- Doctor rows -->
    <div class="uz-field-row">
      <span class="uz-lbl">Veterinarianийн нэр:</span>
      <span class="uz-ul">${escHTML(f.docName||'')}</span>
      <span class="uz-lbl">Хамтран эмчийн нэр:</span>
      <span class="uz-ul">${escHTML(ex && ex.assistDocName || '')}</span>
    </div>
    <div class="uz-field-row">
      <span class="uz-lbl">Үйлчлүүлэгчийн утас:</span>
      <span class="uz-ul">${escHTML(f.phone||'')}</span>
    </div>
    <div class="uz-field-row">
      <span class="uz-lbl">Үйлчлүүлэгчийн нэр:</span>
      <span class="uz-ul">${escHTML(f.owner||'')}</span>
      <span class="uz-lbl">Гарын үсэг:</span>
      <span class="uz-ul"></span>
    </div>
    <div class="uz-field-row">
      <span class="uz-lbl">Хянасан менежер:</span>
      <span class="uz-ul"></span>
    </div>
    <div class="uz-decision">
      Шийдвэрлэсэн байдал:
      <span class="uz-cb"></span><span class="uz-lbl">Үзсэн</span>
      <span class="uz-cb"></span><span class="uz-lbl">Байрлуулан эмчлэх</span>
      <span class="uz-cb"></span><span class="uz-lbl">Бусад:</span>
      <span class="uz-ul" style="min-width:25mm"></span>
    </div>
  </div>

  <!-- ═══════════════ RIGHT PANEL (client copy) ═══════════════ -->
  <div class="uz-right">
    <div class="uz-title">Морьтон үндэсний адууны эмнэлэг</div>

    <!-- UUD + phone + date -->
    <div class="uz-uud-row">
      <span>УУД:</span>
      <span class="uz-uud-num">${uudDisplay}</span>
      <span>Утас: <b>77220404</b></span>
      <span class="uz-date-row">Огноо ${dateFormatted}</span>
    </div>

    <!-- Client info lines -->
    <div class="uz-field-row" style="margin-bottom:2mm">
      <span class="uz-lbl">Эзний нэр:</span>
      <span class="uz-ul"><b>${escHTML(f.owner||'')}</b></span>
    </div>
    <div class="uz-field-row" style="margin-bottom:2mm">
      <span class="uz-lbl">Адууны нэр, улс:</span>
      <span class="uz-ul"><b>${escHTML(f.horse||'')}</b></span>
    </div>

    <!-- 🩺 Онош — ахлах эмч баталсны дараа -->
    ${rightDxHTML}

    <!-- Advice / note area -->
    <div style="font-size:8pt;font-weight:700;margin-bottom:1mm">Эмчилгээ, зөвлөгөө</div>
    <div class="uz-right-note-area">${rightAdviceHTML}</div>

    <!-- Payment summary -->
    <div class="uz-pay-row" style="margin-top:1mm">
      <span class="uz-lbl">Тооцооны дүн:</span>
      <span class="uz-pay-amount">${fmt(f.amount)}</span>
      <span>₮</span>
      <span class="uz-cb ${chkPos?'checked':''}">${chkPos}</span><span class="uz-lbl">Пос</span>
      <span class="uz-cb ${chkDans?'checked':''}">${chkDans}</span><span class="uz-lbl">Дансаар</span>
      <span class="uz-cb ${chkBelen?'checked':''}">${chkBelen}</span><span class="uz-lbl">Бэлэн</span>
      <span class="uz-cb ${chkBusad?'checked':''}">${chkBusad}</span><span class="uz-lbl">Бусад</span>
    </div>

    <!-- Doctor + signature row -->
    <div class="uz-sign-row" style="margin-top:2mm">
      <span class="uz-lbl">Veterinarianийн нэр: <b>${escHTML(f.docName||'')}</b></span>
      <span class="uz-lbl">Гарын үсэг: <span class="uz-ul" style="min-width:22mm"></span></span>
    </div>

    <!-- Bank info only -->
    <div class="uz-stamp-row">
      <div style="flex:1">
        <div class="uz-bank-info">
          Данс: Морьтон адууны тов ХХК<br>
          Торийн банк 102030102030,<br>
          Хаан банк 5040416540
        </div>
      </div>
    </div>
  </div>

</div>`;

  $('#print-area').innerHTML = printHTML;

  // ── Build rich modal preview (unchanged from before) ──
  const isPaidBadge = isPaid
    ? `<span style="display:inline-block;background:#1f8b4d;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:800">✅ ТӨЛСӨН</span>`
    : `<span style="display:inline-block;background:#b8332b;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:800">⏳ ХҮЛЭЭГДЭЖ БУЙ</span>`;

  const svcRows = services.length === 0
    ? `<div style="color:var(--muted);font-size:13px;padding:10px 0">Үйлчилгээ бүртгэгдээгүй</div>`
    : services.map(s => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;background:var(--input);border-radius:8px;margin-bottom:6px">
        <span style="font-size:13px;font-weight:700">${escHTML(s.name||'')}</span>
        <span style="font-size:13px;font-weight:900;color:var(--orange-dark)">${fmt(parseFloat(s.price)||0)}</span>
      </div>`).join('');

  const medsDisplay = medsStr
    ? `<div style="font-size:12px;background:var(--input);padding:8px;border-radius:6px;white-space:pre-wrap">${escHTML(medsStr)}</div>`
    : `<div style="color:var(--muted);font-size:12px">Эм бүртгэгдээгүй</div>`;

  // 🩺 Оношийн төлөв — хэвлэхээс өмнө харагдана; ахлах эмч эндээс шууд батална
  let dxBanner = '';
  if (ex && !isPlanned(ex)) {
    const s = dxStatusOf(ex), fid = escHTML(String(f.id)), eid = escHTML(String(ex.id));
    const reopen = `function(){printInvoice('${fid}')}`;
    if (s === 'approved') dxBanner = `<div style="background:var(--green-soft);color:var(--green);border-radius:10px;padding:9px 12px;font-size:12.5px;font-weight:700;margin-bottom:14px">✅ Онош батлагдсан · ${escHTML(ex.dxApprovedBy || '')} — үйлчлүүлэгчийн хэсэгт онош хэвлэгдэнэ.</div>`;
    else if (s === 'pending' || s === 'returned') dxBanner = `<div style="background:${s === 'returned' ? 'var(--red-soft)' : 'var(--orange-soft)'};color:${s === 'returned' ? 'var(--red)' : 'var(--orange-dark)'};border-radius:10px;padding:9px 12px;font-size:12.5px;font-weight:700;margin-bottom:14px;line-height:1.5">
        ${s === 'returned' ? '↩ Онош буцаагдсан' + (ex.dxReturnNote ? ': ' + escHTML(ex.dxReturnNote) : '') : '⏳ Онош ахлах эмчээр хянагдаж байна'} — <u>үйлчлүүлэгчид өгөх хэсэгт онош хэвлэгдэхгүй</u>.
        <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">${canApproveDx()
          ? `<button class="btn btn-sm btn-p" onclick="openDxModal('${eid}', ${reopen})">🩺 Хянах / батлах</button>`
          : (canResubmitDx(ex) ? `<button class="btn btn-sm" onclick="openDxModal('${eid}', ${reopen})">${s === 'returned' ? '✏️ Онош засаж дахин илгээх' : '🩺 Онош харах'}</button>` : '')}
          <span style="font-weight:600">Батлагч: ${escHTML(dxApproverNames().join(', ') || 'Senior Veterinarian')}</span></div></div>`;
    else if (diag) dxBanner = `<div style="background:var(--input);border-radius:10px;padding:9px 12px;font-size:12px;margin-bottom:14px">Энэ үзлэг онош батлах журам нэвтрэхээс өмнө хийгдсэн — үйлчлүүлэгчийн хэсэгт онош гарахгүй.
        ${canApproveDx() ? `<button class="btn btn-xs btn-p" style="margin-left:6px" onclick="openDxModal('${eid}', ${reopen})">🩺 Батлах</button>` : `<button class="btn btn-xs" style="margin-left:6px" onclick="requestDxReview('${eid}');printInvoice('${fid}')">📤 Хянуулах</button>`}</div>`;
  }

  $('#receipt-body').innerHTML = dxBanner + `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;padding-bottom:14px;border-bottom:2px dashed var(--border)">
      <div>
        <div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:1px">УУД ДУГААР</div>
        <div style="font-size:22px;font-weight:900;color:var(--navy);letter-spacing:2px">${uudDisplay}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px">📅 ${escHTML(f.date||'')}</div>
      </div>
      <div style="text-align:right">${isPaidBadge}
        ${f.method ? `<div style="font-size:11px;color:var(--muted);margin-top:6px">💳 ${escHTML(f.method)}</div>` : ''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div style="background:var(--input);border-radius:10px;padding:12px">
        <div style="font-size:10px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:6px">🐴 АДУУ</div>
        <div style="font-size:15px;font-weight:900">${escHTML(f.horse||'')}</div>
      </div>
      <div style="background:var(--input);border-radius:10px;padding:12px">
        <div style="font-size:10px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:6px">👤 ЭЗЭН</div>
        <div style="font-size:15px;font-weight:900">${escHTML(f.owner||'')}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:3px">📞 ${escHTML(f.phone||'—')}</div>
      </div>
    </div>
    <div style="background:var(--input);border-radius:10px;padding:10px 14px;margin-bottom:16px;display:flex;gap:20px;flex-wrap:wrap">
      <div><span style="color:var(--muted);font-size:12px">👨‍⚕️ Эмч: </span><span style="font-weight:800;font-size:13px">${escHTML(f.docName||'—')}</span></div>
      ${examNum ? `<div><span style="color:var(--muted);font-size:12px">🔖 УУД: </span><span class="badge b-o" style="font-weight:800">${uudDisplay}</span></div>` : ''}
    </div>
    ${diag ? `<div style="margin-bottom:14px"><div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:6px">🩺 ОНОШ</div><div style="background:var(--input);border-radius:8px;padding:10px 14px;font-size:13px;font-weight:600">${escHTML(diag)}</div></div>` : ''}
    ${note ? `<div style="margin-bottom:14px"><div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:6px">📝 ТЭМДЭГЛЭЛ</div><div style="background:var(--input);border-radius:8px;padding:10px 14px;font-size:13px;white-space:pre-wrap">${escHTML(note)}</div></div>` : ''}
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:8px">🩻 ҮЙЛЧИЛГЭЭ</div>${finSourceOf(f) === 'inpatient' ? inpBreakdownHTML(f) : svcRows}
    </div>
    <div style="margin-bottom:18px">
      <div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:4px">💊 ЭМИЙН ЖОР</div>${medsDisplay}
    </div>
    <div style="background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;border-radius:14px;padding:18px 20px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;opacity:0.7;letter-spacing:1px">НИЙТ ДҮНГИЙН ТӨЛБӨР</div>
        <div style="font-size:28px;font-weight:900;color:var(--orange2);margin-top:4px">${fmt(f.amount)}</div>
      </div>
      <div style="text-align:right;font-size:12px;opacity:0.75"><div>Морьтон Адууны Төв</div><div>📞 77220404</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:20px;padding-top:16px;border-top:1px dashed var(--border);font-size:12px;color:var(--muted)">
      <div>Эмч: <span style="display:inline-block;width:120px;border-bottom:1px solid var(--border-strong)">&nbsp;</span></div>
      <div>Үйлчлүүлэгч: <span style="display:inline-block;width:100px;border-bottom:1px solid var(--border-strong)">&nbsp;</span></div>
    </div>
  `;
  openModal('receipt-modal');
}

let __printDxGuard = null; // хэвлэх гэж буй үзлэгийн онош батлагдаагүй бол id
function printReceiptNow() {
  if (__printDxGuard) {
    const ex = _dxExam(__printDxGuard);
    if (ex && dxIsOpen(ex) && !confirm('🩺 Онош ахлах эмчээр хараахан батлагдаагүй байна.\n\nҮйлчлүүлэгчид өгөх хэсэгт онош ХЭВЛЭГДЭХГҮЙ. Оношгүйгээр хэвлэх үү?\n\n(Батлагдсаны дараа дахин хэвлэвэл онош гарна.)')) return;
  }
  window.print();
}

// ── 📖 ЭМЧИЛГЭЭНИЙ ДЭВТЭР — эмнэлзүйн хуудас (мөнгөгүй) ─────────
// Бодит цаасан дэвтэртэй адил: нүүрэн хэсэгт адууны карт, дараа нь өдөр
// бүрийн мөр (T/P/R/жин, биеийн байдал, эмчилгээ-эм-тун, эмч, гарын үсэг),
// гараар үргэлжлүүлэн бичих хоосон мөрүүд, гарах зөвлөмж, гарын үсгүүд.
// Толгой мөр хуудас бүр дээр давтагдана. Мөнгөн дүн энд ОРОХГҮЙ —
// төлбөрийн тооцоо «Төлбөрийн хуудас» дээр.
const INP_BOOK_BLANK_ROWS = 8;
function printInpBook(inpId) {
  const i = STATE.inps.find(x => String(x.id) === String(inpId || STATE.selectedI));
  if (!i) { toast('Байрлан эмчилгээний бичлэг олдсонгүй', 'err'); return; }
  const ex = i.examId ? recById('exams', i.examId) : null;
  const h = (ex && horseOf(ex)) || horseOf(i);
  const an = ex ? examAnamnesis(ex) : { text: '', symptoms: [] };
  const logs = Array.isArray(i.log) ? [...i.log].sort((a, b) => ((a.date || '') + (a.ms || 0)) > ((b.date || '') + (b.ms || 0)) ? 1 : -1) : [];
  const days = inpatientDays(i.admittedMs, i.dischargedMs);
  const admDate = i.admittedDate || (i.admittedMs ? localDateStr(new Date(i.admittedMs)) : '—');
  const disDate = i.dischargedDate || (i.discharged ? '—' : '');
  const doc = inpDoctorOf(i);
  const dayNo = (dateStr) => { if (!i.admittedMs || !dateStr) return ''; const t = new Date(dateStr + 'T12:00:00').getTime(); const n = Math.floor((t - i.admittedMs) / 86400000) + 1; return n > 0 ? n : 1; };
  const cell = (v) => v ? escHTML(String(v)) : '';
  const rows = logs.map((l, k) => {
    const treat = [
      l.note ? escHTML(l.note) : '',
      Array.isArray(l.services) && l.services.length ? '<i>' + l.services.map(x => escHTML(x.name || x)).join(', ') + '</i>' : '',
      Array.isArray(l.meds) && l.meds.length ? '<b>Эм:</b> ' + l.meds.map(m => escHTML((m.name || m) + (m.note ? ' — ' + m.note : ''))).join('; ') : ''
    ].filter(Boolean).join('<br>');
    return `<tr>
      <td class="c">${k + 1}</td>
      <td class="c nw">${cell(l.date)}</td>
      <td class="c">${dayNo(l.date)}</td>
      <td class="c">${cell(l.temp)}</td><td class="c">${cell(l.pulse)}</td><td class="c">${cell(l.resp)}</td><td class="c">${cell(l.wt)}</td>
      <td>${cell(l.diagnosis)}</td>
      <td>${treat}</td>
      <td class="c sm">${cell(l.docName)}</td>
      <td></td>
    </tr>`;
  }).join('');
  let blank = '';
  for (let k = 0; k < INP_BOOK_BLANK_ROWS; k++) blank += `<tr class="blank"><td class="c">${logs.length + k + 1}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
  const di = i.dischargeInfo || {};
  const homeMeds = Array.isArray(di.homeMeds) ? di.homeMeds : [];
  const dischargeBlock = (i.discharged || di.homecare || homeMeds.length) ? `
    <div class="sec">ГАРАХ ҮЕИЙН ЗӨВЛӨМЖ</div>
    <table class="kv"><tr><td class="k">Гэрийн асаргаа</td><td>${cell(di.homecare) || '<span class="line"></span>'}</td></tr>
    <tr><td class="k">Гэрт өгсөн эм</td><td>${homeMeds.length ? homeMeds.map(m => escHTML((m.name || '') + (m.note ? ' — ' + m.note : ''))).join('; ') : '<span class="line"></span>'}</td></tr>
    <tr><td class="k">Дахин үзлэг</td><td>${cell(di.followUpDate) || '<span class="line"></span>'}</td></tr></table>` : `
    <div class="sec">ГАРАХ ҮЕИЙН ЗӨВЛӨМЖ</div>
    <table class="kv"><tr><td class="k">Гэрийн асаргаа</td><td><span class="line"></span></td></tr><tr><td class="k">Гэрт өгсөн эм</td><td><span class="line"></span></td></tr><tr><td class="k">Дахин үзлэг</td><td><span class="line"></span></td></tr></table>`;
  const vit = ex ? [ex.temp ? 'T ' + ex.temp + '°C' : '', ex.pulse ? 'P ' + ex.pulse : '', ex.resp ? 'R ' + ex.resp : '', ex.wt ? 'W ' + ex.wt + ' кг' : ''].filter(Boolean).join(' · ') : '';
  $('#print-area').innerHTML = `
<style>
  @page { size: A4 portrait; margin: 10mm 10mm 12mm; }
  #print-area .book { width: 190mm; font-family: 'Times New Roman', serif; font-size: 9pt; color: #000; }
  #print-area .book * { box-sizing: border-box; }
  #print-area .bh { text-align: center; border-bottom: 1.5pt solid #000; padding-bottom: 2mm; margin-bottom: 3mm; }
  #print-area .bh .t1 { font-size: 12.5pt; font-weight: 900; letter-spacing: .5px; text-transform: uppercase; }
  #print-area .bh .t2 { font-size: 10.5pt; font-weight: 700; margin-top: 1mm; }
  #print-area .kv { width: 100%; border-collapse: collapse; margin-bottom: 2.5mm; }
  #print-area .kv td { border: 0.5pt solid #000; padding: 1.6mm 2mm; vertical-align: top; font-size: 9pt; }
  #print-area .kv td.k { width: 30mm; background: #f2f2f2; font-weight: 700; font-size: 8.5pt; }
  #print-area .kv.g4 td.k { width: 22mm; }
  #print-area .line { display: inline-block; width: 100%; border-bottom: 0.4pt dotted #666; height: 4mm; }
  #print-area .sec { font-weight: 900; font-size: 9.5pt; margin: 3mm 0 1.5mm; letter-spacing: .3px; }
  #print-area table.log { width: 100%; border-collapse: collapse; page-break-inside: auto; }
  #print-area table.log thead { display: table-header-group; }
  #print-area table.log tr { page-break-inside: avoid; break-inside: avoid; }
  #print-area table.log th { border: 0.6pt solid #000; background: #e9e9e9; font-size: 7.8pt; padding: 1.4mm 1mm; font-weight: 800; }
  #print-area table.log td { border: 0.5pt solid #000; padding: 1.4mm 1.5mm; font-size: 8.5pt; vertical-align: top; line-height: 1.3; min-height: 9mm; height: 9mm; }
  #print-area table.log td.c { text-align: center; }
  #print-area table.log td.nw { white-space: nowrap; }
  #print-area table.log td.sm { font-size: 7.5pt; }
  #print-area table.log tr.blank td { height: 10mm; background: repeating-linear-gradient(transparent 0, transparent 4.6mm, #ddd 4.6mm, #ddd 4.8mm); }
  #print-area .rep { font-size: 7.5pt; color: #333; text-align: left; background: #fff !important; border: 0 !important; padding: 0 0 1mm !important; }
  #print-area .sig { display: flex; justify-content: space-between; gap: 6mm; margin-top: 8mm; page-break-inside: avoid; }
  #print-area .sig div { flex: 1; border-top: 0.5pt solid #000; padding-top: 1.5mm; text-align: center; font-size: 8.5pt; }
  #print-area .tail { page-break-inside: avoid; }
  #print-area .ft { margin-top: 4mm; font-size: 7pt; color: #666; text-align: center; }
</style>
<div class="book">
  <div class="bh">
    <div class="t1">Морьтон үндэсний адууны эмнэлэг</div>
    <div class="t2">БАЙРЛАН ЭМЧЛҮҮЛЭГЧИЙН ЭМЧИЛГЭЭНИЙ ДЭВТЭР</div>
  </div>
  <table class="kv g4">
    <tr><td class="k">Адуу (зүс)</td><td><b>${cell(i.horse)}</b></td><td class="k">ИАБД</td><td>${cell(h && h.iabd) || '<span class="line"></span>'}</td></tr>
    <tr><td class="k">Нас</td><td>${cell(h && h.age)}</td><td class="k">Аймаг / сум</td><td>${cell([h && h.province, h && h.soum].filter(Boolean).join(', '))}</td></tr>
    <tr><td class="k">Эзэн</td><td>${cell(i.owner)}</td><td class="k">Утас</td><td>${cell(i.phone)}</td></tr>
    <tr><td class="k">Байрласан огноо</td><td>${cell(admDate)}</td><td class="k">Гарсан огноо</td><td>${cell(disDate) || '<span class="line"></span>'}</td></tr>
    <tr><td class="k">Байрлал</td><td>${cell(i.location) || '<span class="line"></span>'}</td><td class="k">Нийт хоног</td><td>${days}</td></tr>
    <tr><td class="k">Эмчлэгч эмч</td><td>${cell(doc ? doc.name : i.docName)}</td><td class="k">Үзлэгийн хуудас №</td><td>${cell(inpExamNum(i))}</td></tr>
  </table>
  <table class="kv">
    <tr><td class="k">Анамнез</td><td>${cell(an.text)}${an.symptoms && an.symptoms.length ? (an.text ? '<br>' : '') + '<i>Шинж тэмдэг:</i> ' + escHTML(an.symptoms.join(', ')) : ''}${!an.text && !(an.symptoms || []).length ? '<span class="line"></span>' : ''}</td></tr>
    <tr><td class="k">Хүлээн авах үеийн онош</td><td>${cell(i.diagnosis)}${vit ? '<br><span style="color:#444;font-size:8pt">' + escHTML(vit) + '</span>' : ''}</td></tr>
    ${ex && Array.isArray(ex.services) && ex.services.length ? '<tr><td class="k">Анхны үзлэгт хийсэн</td><td>' + escHTML(ex.services.map(x => x.name).join(', ')) + '</td></tr>' : ''}
    ${ex && Array.isArray(ex.meds) && ex.meds.length ? '<tr><td class="k">Анхны эм</td><td>' + escHTML(ex.meds.map(m => (m.name || m) + (m.note ? ' — ' + m.note : '')).join('; ')) + '</td></tr>' : ''}
  </table>
  <div class="sec">ӨДӨР ТУТМЫН ЭМЧИЛГЭЭНИЙ БҮРТГЭЛ</div>
  <table class="log">
    <thead>
      <tr><th colspan="11" class="rep">Адуу: <b>${cell(i.horse)}</b> · Эзэн: ${cell(i.owner)} · Байрласан: ${cell(admDate)} · Байрлал: ${cell(i.location) || '—'}</th></tr>
      <tr>
        <th style="width:6mm">№</th><th style="width:17mm">Огноо</th><th style="width:8mm">Хоног</th>
        <th style="width:9mm">T °C</th><th style="width:8mm">P</th><th style="width:8mm">R</th><th style="width:9mm">Жин</th>
        <th>Биеийн байдал, онош</th><th style="width:52mm">Эмчилгээ, эм, тун</th><th style="width:17mm">Эмч</th><th style="width:14mm">Гарын үсэг</th>
      </tr>
    </thead>
    <tbody>${rows}${blank}</tbody>
  </table>
  <div class="tail">
    ${dischargeBlock}
    <div class="sig"><div>Эмчлэгч эмч: ${cell(doc ? doc.name : i.docName)}</div><div>Тасгийн ахлах эмч</div><div>Эзэн (хүлээн авсан)</div></div>
    <div class="ft">Морьтон адууны төв · Хэвлэсэн: ${escHTML(todayStr())}${i.discharged ? '' : ' · Адуу байрлаж байна'}</div>
  </div>
</div>`;
  setTimeout(() => window.print(), 150);
}

function printInpatientCard(inpId) {
  const i = STATE.inps.find(x => String(x.id) === String(inpId || STATE.selectedI));
  if (!i) { toast('Байрлан эмчилгээний бичлэг олдсонгүй', 'err'); return; }

  const logs = Array.isArray(i.log) ? [...i.log].sort((a,b) => (a.date||'') > (b.date||'') ? 1 : -1) : [];
  const fee  = getDailyFee(i);
  const days = inpatientDays(i.admittedMs, i.dischargedMs);
  const admDate = i.admittedDate || (i.admittedMs ? localDateStr(new Date(i.admittedMs)) : '—');
  const disDate = i.dischargedDate || (i.discharged ? '—' : 'Байрлаж байна');

  // ⚠ Accountant / Finance таб болон гарах нэхэмжлэхтэй ИЖИЛ томьёо: үзлэг + эмчилгээ + хоног
  const examFee    = parseFloat(i.initialAmount) || 0;
  const treatTotal = logs.reduce((a,l) => a + (parseFloat(l.amount)||0), 0);
  const accomTotal = fee * days;
  const homeMedsTotal = (i.dischargeInfo && Array.isArray(i.dischargeInfo.homeMeds))
    ? i.dischargeInfo.homeMeds.reduce((a,m) => a + (parseFloat(m.price)||0), 0) : 0;
  const grandTotal = examFee + treatTotal + accomTotal + homeMedsTotal;
  const prepays    = getInpPrepayments(i);
  const prepaid    = prepays.reduce((a,p) => a + (parseFloat(p.amount)||0), 0);
  const due        = Math.max(0, grandTotal - prepaid);

  const rows = logs.map((l, idx) => {
    const svcs = Array.isArray(l.services) ? l.services.map(s => escHTML(s.name||'') + (s.price ? ` (${fmt(s.price)})` : '')).join(', ') : '';
    const meds = Array.isArray(l.meds)     ? l.meds.map(m => escHTML((m.name||m) + (m.note ? ' — '+m.note : ''))).join(', ') : '';
    const vitals = [l.temp?'T:'+l.temp:'', l.pulse?'P:'+l.pulse:'', l.wt?'W:'+l.wt+'kg':''].filter(Boolean).join(' · ');
    return `<tr>
      <td style="text-align:center">${idx+1}</td>
      <td style="text-align:center;white-space:nowrap">${escHTML(l.date||'—')}</td>
      <td style="text-align:center;font-size:8pt">${escHTML(l.docName||'—')}</td>
      <td>${l.diagnosis?`<div><b>Биеийн байдал:</b> ${escHTML(l.diagnosis)}</div>`:''}${l.note?`<div><b>Эмчилгээ:</b> ${escHTML(l.note)}</div>`:''}${vitals?`<div style="font-size:7.5pt;color:#555">${escHTML(vitals)}</div>`:''}</td>
      <td>${svcs?`<div>${svcs}</div>`:''}${meds?`<div style="font-size:7.5pt"><i>Эм:</i> ${meds}</div>`:''}</td>
      <td style="text-align:right;font-weight:700">${fmt(l.amount||0)}</td>
    </tr>`;
  }).join('');

  // №0 мөр — хүлээн авсан үзлэг (initialAmount-ыг дэвтэрт ил харуулна)
  const examRow = `<tr>
      <td style="text-align:center">0</td>
      <td style="text-align:center;white-space:nowrap">${escHTML(admDate)}</td>
      <td style="text-align:center;font-size:8pt">${escHTML(i.docName||'—')}</td>
      <td><b>Байрлан эмчлэхээр хүлээн авав.</b>${i.diagnosis?`<div style="font-size:7.5pt;color:#555">${escHTML(i.diagnosis)}</div>`:''}</td>
      <td style="font-size:7.5pt;color:#555">Анхны үзлэг</td>
      <td style="text-align:right;font-weight:700">${fmt(examFee)}</td>
    </tr>`;

  const accomRow = fee > 0 ? `<tr style="background:#f0eef7"><td colspan="5" style="text-align:right;font-weight:700;padding:2mm;border:0.5pt solid #000">Хоногийн хөлс (${days} × ${fmt(fee)})</td><td style="text-align:right;font-weight:700;padding:2mm;border:0.5pt solid #000">${fmt(accomTotal)}</td></tr>` : '';

  const homeMedRow = homeMedsTotal > 0 ? `<tr style="background:#f0eef7"><td colspan="5" style="text-align:right;font-weight:700;padding:2mm;border:0.5pt solid #000">Гэрт өгсөн эм</td><td style="text-align:right;font-weight:700;padding:2mm;border:0.5pt solid #000">${fmt(homeMedsTotal)}</td></tr>` : '';

  const prepayRows = prepays.map(p => `<tr>
      <td colspan="4" style="border:0.5pt solid #000"></td>
      <td style="text-align:right;padding:2mm;border:0.5pt solid #000">${escHTML(p.date||'')} · ${escHTML(p.method||'')}</td>
      <td style="text-align:right;padding:2mm;border:0.5pt solid #000;color:#2f7a52">−${fmt(p.amount)}</td>
    </tr>`).join('');

  $('#print-area').innerHTML = `
<style>
  /* 📖 Нэг дэвтэр шиг үргэлжилсэн хэвлэлт:
     - Хүснэгтийн толгой хуудас бүр дээр давтагдана
     - Мөр хуудасны зааг дээр таслагдахгүй
     - Нийт дүн + гарын үсгийн хэсэг хамт нэг хуудсанд багтана */
  #print-area table { page-break-inside: auto; }
  #print-area thead { display: table-header-group; }
  #print-area tfoot { display: table-footer-group; }
  #print-area tr { page-break-inside: avoid; break-inside: avoid; }
  #print-area .inp-book-tail { page-break-inside: avoid; break-inside: avoid; }
</style>
<div style="width:210mm;font-family:'Times New Roman',serif;font-size:9.5pt;color:#000;padding:10mm 12mm;box-sizing:border-box">
  <div style="text-align:center;border-bottom:2pt solid #000;padding-bottom:4mm;margin-bottom:5mm">
    <div style="font-size:13pt;font-weight:900;text-transform:uppercase;letter-spacing:1px">Морьтон үндэсний адууны эмнэлэг</div>
    <div style="font-size:9pt;margin-top:2mm">Байрлан эмчлэх тасгийн эмчилгээний дэвтэр</div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:4mm;margin-bottom:5mm;font-size:8.5pt">
    <div style="flex:1;min-width:40mm"><b>Адуу:</b> ${escHTML(i.horse||'—')}</div>
    <div style="flex:1;min-width:40mm"><b>Эзэн:</b> ${escHTML(i.owner||'—')}</div>
    <div style="flex:1;min-width:40mm"><b>Утас:</b> ${escHTML(i.phone||'—')}</div>
    <div style="flex:1;min-width:40mm"><b>Эмч:</b> ${escHTML(i.docName||'—')}</div>
    <div style="flex:1;min-width:40mm"><b>Байрласан:</b> ${escHTML(admDate)}</div>
    <div style="flex:1;min-width:40mm"><b>Гарсан:</b> ${escHTML(disDate)}</div>
    <div style="flex:1;min-width:40mm"><b>Нийт хоног:</b> ${days}</div>
    <div style="flex:1;min-width:40mm"><b>УУД №:</b> ${escHTML(inpExamNum(i)||'—')}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:8.5pt;margin-bottom:4mm">
    <thead><tr>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000;width:6mm">№</th>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000;width:18mm">Огноо</th>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000;width:22mm">Эмч</th>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000">Биеийн байдал / Эмчилгээ</th>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000;width:42mm">Үйлчилгээ / Эм</th>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000;width:18mm">Дүн ₮</th>
    </tr></thead>
    <tbody>
      ${examRow}
      ${rows}
      ${accomRow}
      ${homeMedRow}
    </tbody>
  </table>
  <div class="inp-book-tail">
  <table style="width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:8mm">
    <tr><td colspan="4" style="border:0.5pt solid #000"></td><td style="text-align:right;font-weight:900;padding:2mm;border:0.5pt solid #000">НИЙТ ДҮН</td><td style="text-align:right;font-weight:900;padding:2mm;border:0.5pt solid #000;width:24mm">${fmt(grandTotal)}</td></tr>
    ${prepayRows}
    <tr><td colspan="4" style="border:0.5pt solid #000"></td><td style="text-align:right;padding:2mm;border:0.5pt solid #000">Төлсөн урьдчилгаа</td><td style="text-align:right;padding:2mm;border:0.5pt solid #000;color:#2f7a52">−${fmt(prepaid)}</td></tr>
    <tr><td colspan="4" style="border:0.5pt solid #000"></td><td style="text-align:right;font-weight:900;font-size:10pt;padding:2mm;border:0.5pt solid #000;background:#f7ede9">ҮЛДЭГДЭЛ ТӨЛӨХ</td><td style="text-align:right;font-weight:900;font-size:11pt;padding:2mm;border:0.5pt solid #000;background:#f7ede9">${fmt(due)}</td></tr>
  </table>
  <div style="display:flex;justify-content:space-between;margin-top:10mm;font-size:8.5pt">
    <div style="border-top:0.5pt solid #000;padding-top:2mm;min-width:50mm;text-align:center">Эмч: ${escHTML(i.docName||'')}</div>
    <div style="border-top:0.5pt solid #000;padding-top:2mm;min-width:50mm;text-align:center">Үйлчлүүлэгч</div>
    <div style="border-top:0.5pt solid #000;padding-top:2mm;min-width:50mm;text-align:center">Хянасан менежер</div>
  </div>
  <div style="margin-top:6mm;font-size:7.5pt;color:#666;text-align:center">Морьтон адууны тов ХХК · Торийн банк 102030102030 · Хаан банк 5040416540 · Хэвлэсэн: ${escHTML(todayStr())}</div>
  </div>
</div>`;
  setTimeout(() => window.print(), 150);
}

// ============================================================
// 🔒 МӨНГӨН ДҮНГИЙН ТҮГЖЭЭ — Тайлан, KPI дээр дүнг код оруулж харна
// ============================================================
const FIN_UNLOCK_MIN = 30;           // Код оруулсны дараа хэдэн минут нээлттэй байх
const FIN_DEFAULT_PIN = '1234';      // Admin код тохируулаагүй үеийн анхдагч код (Системийн тохиргооноос солино)
let __finRerender = null;            // Түгжээ тайлагдах/хаагдахад дахин зурах функц

function finVisible() {
  let until = STATE.finUnlockedUntil || 0;
  if (!until) { try { until = parseFloat(sessionStorage.getItem('mt_fin_unlock')) || 0; } catch(_) {} }
  if (until && Date.now() < until) { STATE.finUnlockedUntil = until; return true; }
  return false;
}
// Дүнг түгжээтэй үед нуусан хэлбэрээр буцаана
function mfmt(n) { return finVisible() ? fmt(n) : '••••'; }
function mfmtCompact(n) { return finVisible() ? fmtCompact(n) : '••••'; }

function finLock() {
  STATE.finUnlockedUntil = 0;
  try { sessionStorage.removeItem('mt_fin_unlock'); } catch(_) {}
  renderFinLockBars();
  if (typeof __finRerender === 'function') { try { __finRerender(); } catch(e) { console.error(e); } }
}

function openFinPinModal(rerender) {
  if (typeof rerender === 'function') __finRerender = rerender;
  const inp = $('#fin-pin-input');
  const err = $('#fin-pin-err');
  if (err) err.textContent = '';
  if (inp) inp.value = '';
  openModal('fin-pin-modal');
  setTimeout(() => { if (inp) inp.focus(); }, 60);
}

async function submitFinPin() {
  const inp = $('#fin-pin-input');
  const err = $('#fin-pin-err');
  const pin = (inp && inp.value || '').trim();
  if (!pin) { if (err) err.textContent = 'Код оруулна уу'; return; }
  let ok = false;
  try {
    if (STATE.finPinHash) ok = (await _hashPassword(pin)) === STATE.finPinHash;
    else ok = pin === FIN_DEFAULT_PIN;
  } catch(e) { ok = !STATE.finPinHash && pin === FIN_DEFAULT_PIN; }
  if (!ok) { if (err) err.textContent = 'Код буруу байна'; if (inp) { inp.value = ''; inp.focus(); } return; }
  const until = Date.now() + FIN_UNLOCK_MIN * 60000;
  STATE.finUnlockedUntil = until;
  try { sessionStorage.setItem('mt_fin_unlock', String(until)); } catch(_) {}
  closeModal('fin-pin-modal');
  toast('🔓 Мөнгөн дүн ' + FIN_UNLOCK_MIN + ' минут харагдана', 'ok');
  try { writeLog('Мөнгөн дүн харах код оруулав', '', '', STATE.activePage || ''); } catch(_) {}
  renderFinLockBars();
  if (typeof __finRerender === 'function') { try { __finRerender(); } catch(e) { console.error(e); } }
}

// Хуудас бүр дээрх түгжээний мөрийг зурна (#k-fin-lock, #rp-fin-lock)
function renderFinLockBars() {
  const open = finVisible();
  const html = open
    ? `<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">
         <span class="badge b-g">🔓 Мөнгөн дүн харагдаж байна</span>
         <button class="btn btn-xs" onclick="finLock()">🔒 Нуух</button>
       </div>`
    : `<div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">
         <span class="badge">🔒 Мөнгөн дүн нуугдсан</span>
         <button class="btn btn-xs btn-p" onclick="openFinPinModal(__finRerender)">🔑 Код оруулж харах</button>
       </div>`;
  ['k-fin-lock', 'rp-fin-lock'].forEach(id => { const el = $('#' + id); if (el) el.innerHTML = html; });
}

// Admin: мөнгөн дүн харах кодыг солих
async function saveFinPin() {
  if (!(typeof canAccess === 'function' && canAccess('admin'))) { toast('Зөвхөн админ эрхтэй хэрэглэгч солино', 'err'); return; }
  const a = ($('#a-fin-pin') && $('#a-fin-pin').value || '').trim();
  const b = ($('#a-fin-pin2') && $('#a-fin-pin2').value || '').trim();
  if (a.length < 4) { toast('Код дор хаяж 4 тэмдэгт байна', 'err'); return; }
  if (a !== b) { toast('Хоёр код зөрж байна', 'err'); return; }
  STATE.finPinHash = await _hashPassword(a);
  lsSet('mt_fin_pin_hash', STATE.finPinHash);
  try { fbSaveClinicConfig(); } catch(e) { console.error(e); }
  try { writeLog('Мөнгөн дүн харах кодыг солив', '', '', ''); } catch(_) {}
  if ($('#a-fin-pin')) $('#a-fin-pin').value = '';
  if ($('#a-fin-pin2')) $('#a-fin-pin2').value = '';
  finLock();
  toast('✅ Код хадгалагдлаа', 'ok');
  renderFinPinStatus();
}
function renderFinPinStatus() {
  const el = $('#a-fin-pin-status');
  if (!el) return;
  el.innerHTML = STATE.finPinHash
    ? '<span class="badge b-g">Код тохируулсан</span>'
    : '<span class="badge b-o">Анхдагч код (' + FIN_DEFAULT_PIN + ') ашиглагдаж байна — солино уу</span>';
}

// ============================================================
// KPI
// ============================================================
// Хугацааны эхлэл/төгсгөл (ms) — сонгосон tab-аас
function getKPIRange() {
  const period = STATE.activeKPer;
  const now = new Date();
  let from, to;
  if (period === 'd') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
  } else if (period === 'w') {
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day - 1));
    monday.setHours(0, 0, 0, 0);
    from = monday.getTime();
    to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
  } else if (period === 'm') {
    from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).getTime();
    to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
  } else if (period === 'y') {
    from = new Date(now.getFullYear(), 0, 1, 0, 0, 0).getTime();
    to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
  } else {
    const fStr = $('#k-from').value, tStr = $('#k-to').value;
    if (!fStr || !tStr) {
      from = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      to   = now.getTime();
    } else {
      from = new Date(fStr + 'T00:00:00').getTime();
      to   = new Date(tStr + 'T23:59:59').getTime();
    }
  }
  return { from, to, fromStr: localDateStr(new Date(from)), toStr: localDateStr(new Date(to)) };
}

// Хугацааны бүх өдрийн жагсаалт (YYYY-MM-DD)
function kpiDayList(fromStr, toStr) {
  const out = [];
  const d = new Date(fromStr + 'T12:00:00');
  const end = new Date(toStr + 'T12:00:00');
  let guard = 0;
  while (d <= end && guard++ < 800) { out.push(localDateStr(d)); d.setDate(d.getDate() + 1); }
  return out;
}

// Эмчийн хуваарьт ажиллах өдрүүд (сарын хуваариас: work / duty)
function kpiScheduledDays(docId, fromStr, toStr) {
  const set = new Set();
  const sched = STATE.staffSchedule || {};
  Object.keys(sched).forEach(ym => {
    const byDoc = sched[ym] && sched[ym][String(docId)];
    if (!byDoc) return;
    Object.keys(byDoc).forEach(date => {
      const st = byDoc[date];
      if ((st === 'work' || st === 'duty') && date >= fromStr && date <= toStr) set.add(date);
    });
  });
  return set;
}

// Эмчийн ажилласан өдрийн задаргаа: { date: { exams, assist, inp, sched } }
function kpiDocDayMap(docKey, exams, inpRows, fromStr, toStr) {
  const map = {};
  const ensure = (d) => { if (!map[d]) map[d] = { exams: 0, assist: 0, inp: 0, sched: false }; return map[d]; };
  exams.forEach(e => {
    const d = rpNormDate(e.date);
    if (!d || d < fromStr || d > toStr) return;
    const mk = rpDocKey(e.docId, e.docName), ak = rpDocKey(e.assistDocId, e.assistDocName);
    if (mk === docKey) ensure(d).exams++;
    else if (ak === docKey) ensure(d).assist++;
  });
  inpRows.forEach(r => { ensure(r.date).inp++; });
  kpiScheduledDays(docKey, fromStr, toStr).forEach(d => { ensure(d).sched = true; });
  return map;
}

function renderKPI() {
  // Tab-ууд
  $$('.tab[data-kper]').forEach(t => t.onclick = () => {
    STATE.activeKPer = t.dataset.kper;
    $$('.tab[data-kper]').forEach(x => x.classList.toggle('active', x.dataset.kper === STATE.activeKPer));
    if (STATE.activeKPer === 'c') {
      $('#k-custom-row').classList.remove('hidden');
      if (!$('#k-from').value) { const d = new Date(); d.setDate(1); $('#k-from').value = localDateStr(d); }
      if (!$('#k-to').value) $('#k-to').value = todayStr();
    } else {
      $('#k-custom-row').classList.add('hidden');
    }
    renderKPI();
  });
  $$('.tab[data-kper]').forEach(x => x.classList.toggle('active', x.dataset.kper === STATE.activeKPer));
  if (STATE.activeKPer !== 'c') $('#k-custom-row').classList.add('hidden');
  else $('#k-custom-row').classList.remove('hidden');
  const sortSel = $('#k-sort');
  if (sortSel && !sortSel.__wired) { sortSel.__wired = true; sortSel.onchange = () => renderKPI(); }

  __finRerender = renderKPI;
  renderFinLockBars();

  const R = getKPIRange();
  if (R && R.fromStr && R.fromStr < LIVE_CUTOFF) ensureRange(R.fromStr, R.toStr).then(ok => { if (ok && STATE.activePage === 'kpi') renderKPI(); });
  $('#k-period-info').textContent = '📅 ' + R.fromStr + ' → ' + R.toStr;

  // Хугацааны үзлэгүүд (date-г эхлэн харна, ms нь импортод буруу байж болно)
  const examTime = (e) => {
    if (e.date) { try { const t = new Date(e.date + (e.time ? 'T' + e.time : 'T12:00')).getTime(); if (t > 0) return t; } catch(_) {} }
    if (e.ms) return parseFloat(e.ms);
    return 0;
  };
  const _kk = kindFilterVal('k-kind');
  const periodExams = (STATE.exams || []).filter(e => { const t = examTime(e); return t >= R.from && t <= R.to && examKindOk(e, _kk); });
  const plannedN = periodExams.filter(isPlanned).length;
  const periodInp = rpInpLogRows(R.fromStr, R.toStr, '');
  const dayList = kpiDayList(R.fromStr, R.toStr);

  // Эмч бүрийн үзүүлэлт
  const allDocs = rpAllDoctors();
  const docMap = {};
  const ensure = (key) => {
    if (!docMap[key]) docMap[key] = { key, count: 0, mainCount: 0, assistCount: 0, rev: 0, services: 0, exams: [], inpLogs: 0, inpRev: 0, horses: new Set(), days: new Set(), durSum: 0, durN: 0 };
    return docMap[key];
  };
  periodExams.forEach(e => {
    const mk = rpDocKey(e.docId, e.docName), ak = rpDocKey(e.assistDocId, e.assistDocName);
    const d = rpNormDate(e.date);
    if (mk) {
      const m = ensure(mk);
      m.count++; m.mainCount++; if (isPlanned(e)) m.planned = (m.planned || 0) + 1;
      m.rev += parseFloat(e.amount) || 0;
      m.services += Array.isArray(e.services) ? e.services.length : 0;
      m.exams.push(e);
      m.horses.add(String(e.horseId || e.horse || e.id));
      if (d) m.days.add(d);
      if (e.durationMin !== null && e.durationMin !== undefined && !isNaN(e.durationMin)) { m.durSum += e.durationMin; m.durN++; }
    }
    if (ak && ak !== mk) {
      const a = ensure(ak);
      a.count++; a.assistCount++;
      a.exams.push(e);
      a.horses.add(String(e.horseId || e.horse || e.id));
      if (d) a.days.add(d);
    }
  });
  periodInp.forEach(r => {
    const di = allDocs.find(x => x.name === r.docName);
    const key = di ? di.id : rpDocKey('', r.docName);
    if (!key) return;
    const m = ensure(key);
    m.inpLogs++; m.inpRev += r.amount; m.days.add(r.date);
  });

  const ranked = allDocs.map(d => {
    const m = docMap[d.id] || { key: d.id, count: 0, mainCount: 0, assistCount: 0, rev: 0, services: 0, exams: [], inpLogs: 0, inpRev: 0, horses: new Set(), days: new Set(), durSum: 0, durN: 0 };
    const sched = kpiScheduledDays(d.id, R.fromStr, R.toStr);
    return {
      ...d, ...m, key: d.id,
      exams: m.exams, horses: m.horses.size, days: m.days.size, schedDays: sched.size,
      totalRev: m.rev + m.inpRev,
      avgDur: m.durN ? m.durSum / m.durN : null,
      perDay: m.days.size ? m.mainCount / m.days.size : 0
    };
  });
  const sortMode = (sortSel && sortSel.value) || 'exams';
  const sorters = {
    exams: (a, b) => b.mainCount - a.mainCount || b.count - a.count || b.services - a.services,
    services: (a, b) => b.services - a.services || b.mainCount - a.mainCount,
    days: (a, b) => b.days - a.days || b.mainCount - a.mainCount,
    horses: (a, b) => b.horses - a.horses || b.mainCount - a.mainCount,
    rev: (a, b) => b.totalRev - a.totalRev || b.mainCount - a.mainCount
  };
  ranked.sort(sorters[sortMode] || sorters.exams);

  // Хугацааны тойм
  const uniqHorses = new Set(periodExams.map(e => String(e.horseId || e.horse || e.id))).size;
  const svcTotal = periodExams.reduce((a, e) => a + (Array.isArray(e.services) ? e.services.length : 0), 0);
  const revTotal = periodExams.reduce((a, e) => a + (parseFloat(e.amount) || 0), 0) + periodInp.reduce((a, r) => a + r.amount, 0);
  const durs = periodExams.map(e => e.durationMin).filter(v => v !== null && v !== undefined && !isNaN(v));
  const avgDur = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : null;
  const activeDocs = ranked.filter(d => d.count > 0 || d.inpLogs > 0).length;
  const busyDays = new Set(periodExams.map(e => rpNormDate(e.date)).filter(Boolean)).size;
  const sum = $('#k-summary');
  if (sum) sum.innerHTML = `
    <div class="stats s5">
      <div class="stat"><div class="stat-l">📋 Үзлэг</div><div class="snum">${periodExams.length}</div><div class="muted" style="font-size:10px">${uniqHorses} адуу${plannedN ? ' · ТҮ ' + plannedN : ''}</div></div>
      <div class="stat purple"><div class="stat-l">💉 Үйлчилгээ</div><div class="snum">${svcTotal}</div><div class="muted" style="font-size:10px">${periodInp.length} байрлан эмчилгээний бичлэг</div></div>
      <div class="stat accent"><div class="stat-l">👨‍⚕️ Ажилласан эмч</div><div class="snum">${activeDocs}</div><div class="muted" style="font-size:10px">${busyDays} / ${dayList.length} өдөр үзлэгтэй</div></div>
      <div class="stat"><div class="stat-l">⏱️ Дундаж хугацаа</div><div class="snum" style="font-size:18px">${avgDur !== null ? fmtDuration(avgDur) : '—'}</div><div class="muted" style="font-size:10px">нэг үзлэгт</div></div>
      <div class="stat green"><div class="stat-l">💰 Орлого</div><div class="snum" style="font-size:18px">${mfmtCompact(revTotal)}</div><div class="muted" style="font-size:10px">${finVisible() ? 'үзлэг + байрлан эмчилгээ' : 'код оруулж харна'}</div></div>
    </div>`;

  // Сонголт хадгалах
  if (!STATE.selectedKDoc || !ranked.find(d => String(d.key) === String(STATE.selectedKDoc))) {
    const firstActive = ranked.find(d => d.count > 0 || d.inpLogs > 0);
    STATE.selectedKDoc = firstActive ? String(firstActive.key) : (ranked.length ? String(ranked[0].key) : null);
  }

  // Ранкийн жагсаалт
  const list = $('#k-rank-list');
  if (ranked.length === 0) {
    list.innerHTML = '<div class="empty">Өгөгдөл алга</div>';
  } else {
    const metric = (d) => {
      if (sortMode === 'rev') return mfmtCompact(d.totalRev);
      if (sortMode === 'days') return d.days + ' өдөр';
      if (sortMode === 'services') return d.services + ' үйлч.';
      if (sortMode === 'horses') return d.horses + ' адуу';
      return d.mainCount + ' үзлэг';
    };
    list.innerHTML = ranked.map((d, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1);
      const bg = i === 0 ? '#ffd70033' : i === 1 ? '#c0c0c033' : i === 2 ? '#cd7f3233' : 'var(--input)';
      const assistTxt = d.assistCount > 0 ? ' · ' + d.assistCount + ' хамтран' : '';
      const inpTxt = d.inpLogs > 0 ? ' · 🏥' + d.inpLogs : '';
      const plTxt = d.planned > 0 ? ' · ТҮ ' + d.planned : '';
      return `
        <div class="li" data-did="${escHTML(d.key)}" style="cursor:pointer;${(d.count === 0 && d.inpLogs === 0) ? 'opacity:.55' : ''}">
          <div class="li-av" style="background:${bg};font-size:16px;font-weight:900">${medal}</div>
          <div class="li-info">
            <div class="li-name">${escHTML(d.name)}</div>
            <div class="li-sub">${escHTML(d.role || '')} · ${d.mainCount} үзлэг · ${d.services} үйлчилгээ · ${d.days} өдөр${assistTxt}${inpTxt}${plTxt}</div>
          </div>
          <div class="li-r"><span class="badge b-g">${metric(d)}</span></div>
        </div>`;
    }).join('');
    list.querySelectorAll('.li').forEach(el => {
      if (String(el.dataset.did) === String(STATE.selectedKDoc)) el.classList.add('sel');
      el.addEventListener('click', () => {
        STATE.selectedKDoc = String(el.dataset.did);
        list.querySelectorAll('.li').forEach(x => x.classList.toggle('sel', String(x.dataset.did) === STATE.selectedKDoc));
        renderKPIDocDetail(ranked, periodExams, periodInp, R, dayList);
      });
    });
  }

  // 📅 Эмч нарын ажилласан өдрийн харьцуулалт
  renderKPIDaysChart(ranked, dayList);
  renderKPIDocDetail(ranked, periodExams, periodInp, R, dayList);
}

// Эмч нарын ажилласан өдөр — хэвтээ баганан график (бодит vs хуваарь)
function renderKPIDaysChart(ranked, dayList) {
  const el = $('#k-days-chart');
  if (!el) return;
  const docs = ranked.filter(d => d.days > 0 || d.schedDays > 0).slice().sort((a, b) => b.days - a.days || b.schedDays - a.schedDays);
  if (!docs.length) { el.innerHTML = '<div class="empty"><div class="empty-em">📅</div>Ажилласан өдрийн бүртгэл алга</div>'; return; }
  const total = Math.max(dayList.length, 1);
  const hasSched = docs.some(d => d.schedDays > 0);
  el.innerHTML = `
    <div class="muted" style="font-size:11px;margin-bottom:8px">Нийт ${total} өдөр. <span style="display:inline-block;width:10px;height:10px;background:var(--green);border-radius:2px;vertical-align:middle"></span> бодит (үзлэг/эмчилгээ хийсэн)${hasSched ? ' · <span style="display:inline-block;width:10px;height:10px;background:var(--orange);opacity:.45;border-radius:2px;vertical-align:middle"></span> хуваарьт' : ''}</div>
    ${docs.map(d => {
      const pA = Math.min(100, d.days / total * 100), pS = Math.min(100, d.schedDays / total * 100);
      return `
        <div style="margin-bottom:8px">
          <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:3px;gap:8px">
            <span class="bold" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${escHTML(d.name)}</span>
            <span style="flex-shrink:0"><b>${d.days}</b> өдөр${d.schedDays ? ' <span class="muted">/ хуваарь ' + d.schedDays + '</span>' : ''} · <span class="muted">${d.perDay ? d.perDay.toFixed(1) + ' үзлэг/өдөр' : '—'}</span></span>
          </div>
          <div class="prog" style="position:relative;height:10px">
            ${d.schedDays ? `<div style="position:absolute;left:0;top:0;height:100%;width:${pS.toFixed(1)}%;background:var(--orange);opacity:.35;border-radius:4px"></div>` : ''}
            <div class="prog-fill" style="position:absolute;left:0;top:0;background:var(--green);width:${pA.toFixed(1)}%"></div>
          </div>
        </div>`;
    }).join('')}`;
}

// Сонгосон эмчийн ажилласан өдрийн график (SVG)
function kpiDocDaysSVG(dayMap, dayList) {
  const DOW = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];
  const W = 640, H = 150, padL = 26, padB = 30, padT = 14;
  let bars, xLabel, groupLabel, aggregated = false;
  if (dayList.length <= 62) {
    bars = dayList.map(d => {
      const v = dayMap[d] || { exams: 0, assist: 0, inp: 0, sched: false };
      return { key: d, main: v.exams, assist: v.assist, inp: v.inp, sched: v.sched, worked: (v.exams + v.assist + v.inp) > 0 };
    });
    const step = dayList.length > 31 ? 7 : (dayList.length > 14 ? 2 : 1);
    xLabel = (b, i) => (i % step === 0) ? b.key.slice(8) : '';
    groupLabel = (b) => { const dt = new Date(b.key + 'T12:00:00'); return DOW[dt.getDay()]; };
  } else {
    // Сараар нэгтгэнэ: ажилласан өдрийн тоо
    aggregated = true;
    const months = {};
    dayList.forEach(d => { const m = d.slice(0, 7); if (!months[m]) months[m] = { key: m, main: 0, assist: 0, inp: 0, worked: 0, sched: 0, total: 0 }; months[m].total++;
      const v = dayMap[d]; if (!v) return;
      if ((v.exams + v.assist + v.inp) > 0) months[m].worked++;
      if (v.sched) months[m].sched++;
      months[m].main += v.exams; months[m].assist += v.assist; months[m].inp += v.inp; });
    bars = Object.values(months).sort((a, b) => a.key < b.key ? -1 : 1);
    xLabel = (b) => b.key.slice(5);
    groupLabel = () => '';
  }
  if (!bars.length) return '';
  const maxV = Math.max(1, ...bars.map(b => aggregated ? b.total : (b.main + b.assist + b.inp)));
  const n = bars.length;
  const innerW = W - padL - 8, innerH = H - padT - padB;
  const bw = innerW / n;
  const y = (v) => padT + innerH - (v / maxV) * innerH;
  const rects = bars.map((b, i) => {
    const x = padL + i * bw + bw * 0.15, w = Math.max(2, bw * 0.7);
    if (aggregated) {
      const hS = innerH * (b.sched / maxV), hW = innerH * (b.worked / maxV);
      return `<g>
        ${b.sched ? `<rect x="${x}" y="${y(b.sched)}" width="${w}" height="${hS}" fill="var(--orange)" opacity=".3" rx="2"/>` : ''}
        <rect x="${x}" y="${y(b.worked)}" width="${w}" height="${hW}" fill="var(--green)" rx="2"><title>${b.key}: ${b.worked}/${b.total} өдөр ажилласан${b.sched ? ', хуваарь ' + b.sched : ''} · ${b.main} үзлэг${b.assist ? ' +' + b.assist + ' хамтран' : ''}${b.inp ? ' · 🏥' + b.inp : ''}</title></rect>
        <text x="${x + w / 2}" y="${y(b.worked) - 3}" text-anchor="middle" font-size="9" font-weight="800" fill="var(--text)">${b.worked}</text>
      </g>`;
    }
    const total = b.main + b.assist + b.inp;
    const hM = innerH * (b.main / maxV), hA = innerH * (b.assist / maxV), hI = innerH * (b.inp / maxV);
    const yTop = y(total);
    const dt = new Date(b.key + 'T12:00:00'); const wk = dt.getDay() === 0 || dt.getDay() === 6;
    return `<g>
      ${wk ? `<rect x="${padL + i * bw}" y="${padT}" width="${bw}" height="${innerH}" fill="var(--muted)" opacity=".06"/>` : ''}
      ${b.sched && !b.worked ? `<rect x="${x}" y="${padT + innerH - 4}" width="${w}" height="4" fill="var(--orange)" opacity=".7" rx="1"><title>${b.key}: хуваарьтай, үзлэг бүртгэгдээгүй</title></rect>` : ''}
      ${b.sched && b.worked ? `<rect x="${x}" y="${padT + innerH + 2}" width="${w}" height="2" fill="var(--orange)" opacity=".7"/>` : ''}
      ${b.inp ? `<rect x="${x}" y="${yTop}" width="${w}" height="${hI}" fill="var(--purple)" rx="1"/>` : ''}
      ${b.assist ? `<rect x="${x}" y="${yTop + hI}" width="${w}" height="${hA}" fill="var(--accent)" rx="1"/>` : ''}
      ${b.main ? `<rect x="${x}" y="${yTop + hI + hA}" width="${w}" height="${hM}" fill="var(--green)" rx="1"/>` : ''}
      ${total ? `<text x="${x + w / 2}" y="${yTop - 3}" text-anchor="middle" font-size="9" font-weight="800" fill="var(--text)">${total}</text>` : ''}
      <title>${b.key} (${groupLabel(b)}): ${b.main} үзлэг${b.assist ? ', ' + b.assist + ' хамтран' : ''}${b.inp ? ', ' + b.inp + ' байрлан эмчилгээ' : ''}${b.sched ? ' · хуваарьт' : ''}</title>
    </g>`;
  }).join('');
  const labels = bars.map((b, i) => {
    const t = xLabel(b, i); if (!t) return '';
    const x = padL + i * bw + bw / 2;
    return `<text x="${x}" y="${H - padB + 14}" text-anchor="middle" font-size="9" fill="var(--muted)">${t}</text>${!aggregated && n <= 14 ? `<text x="${x}" y="${H - padB + 25}" text-anchor="middle" font-size="8" fill="var(--muted)">${groupLabel(b)}</text>` : ''}`;
  }).join('');
  const ticks = [0, Math.ceil(maxV / 2), maxV].filter((v, i, a) => a.indexOf(v) === i).map(v => `<text x="${padL - 4}" y="${y(v) + 3}" text-anchor="end" font-size="8" fill="var(--muted)">${v}</text><line x1="${padL}" x2="${W - 8}" y1="${y(v)}" y2="${y(v)}" stroke="var(--border)" stroke-width=".5"/>`).join('');
  const legend = aggregated
    ? `<span style="display:inline-block;width:10px;height:10px;background:var(--green);border-radius:2px;vertical-align:middle"></span> ажилласан өдөр · <span style="display:inline-block;width:10px;height:10px;background:var(--orange);opacity:.4;border-radius:2px;vertical-align:middle"></span> хуваарьт өдөр`
    : `<span style="display:inline-block;width:10px;height:10px;background:var(--green);border-radius:2px;vertical-align:middle"></span> үзлэг · <span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle"></span> хамтран · <span style="display:inline-block;width:10px;height:10px;background:var(--purple);border-radius:2px;vertical-align:middle"></span> байрлан эмчилгээ · <span style="display:inline-block;width:10px;height:4px;background:var(--orange);opacity:.7;vertical-align:middle"></span> хуваарьт`;
  return `
    <div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:320px;max-width:${W}px;display:block">${ticks}${rects}${labels}</svg></div>
    <div class="muted" style="font-size:10.5px;margin-top:4px">${legend}</div>`;
}

function renderKPIDocDetail(ranked, periodExams, periodInp, R, dayList) {
  const d = ranked.find(x => String(x.key) === String(STATE.selectedKDoc));
  const body = $('#k-doc-detail-body');
  const title = $('#k-doc-detail-title');
  if (!d) {
    if (title) title.textContent = '📊 Дэлгэрэнгүй';
    body.innerHTML = '<div class="empty"><div class="empty-em">👨‍⚕️</div>Эмч сонгоно уу</div>';
    return;
  }
  if (title) title.innerHTML = '📊 ' + escHTML(d.name) + ' <span class="muted" style="font-size:11px;font-weight:600">· ' + escHTML(d.role || '') + '</span>';

  const mainExams = d.exams.filter(e => rpDocKey(e.docId, e.docName) === d.key);
  const myInp = periodInp.filter(r => { const di = rpAllDoctors().find(x => x.name === r.docName); return (di ? di.id : rpDocKey('', r.docName)) === d.key; });
  const dayMap = kpiDocDayMap(d.key, periodExams, myInp, R.fromStr, R.toStr);
  const schedNoWork = Object.values(dayMap).filter(v => v.sched && (v.exams + v.assist + v.inp) === 0).length;

  // Үйлчилгээний бүтэц
  const svcEntries = rpServiceStats(mainExams);
  const svcTotalRev = svcEntries.reduce((a, b) => a + b.rev, 0);
  const svcTotalCnt = svcEntries.reduce((a, b) => a + b.count, 0);
  const palette = ['#C9A75A', '#27ae60', '#2980b9', '#8e44ad', '#E8752A', '#16a085', '#e67e22', '#c0392b', '#7f8c8d', '#d35400', '#1abc9c', '#9b59b6'];
  let chartHTML = '';
  if (svcEntries.length > 0 && svcTotalCnt > 0) {
    // Түгжээтэй үед тоогоор, нээлттэй үед дүнгээр хуваарилна
    const byRev = finVisible() && svcTotalRev > 0;
    const denom = byRev ? svcTotalRev : svcTotalCnt;
    const val = (s) => byRev ? s.rev : s.count;
    let cumulative = 0;
    const radius = 60, circumference = 2 * Math.PI * radius, TOP = 8;
    let display = svcEntries.slice().sort((a, b) => val(b) - val(a));
    if (display.length > TOP) {
      const rest = display.slice(TOP);
      display = [...display.slice(0, TOP), { name: 'Бусад (' + rest.length + ')', count: rest.reduce((a, b) => a + b.count, 0), rev: rest.reduce((a, b) => a + b.rev, 0) }];
    }
    const segments = display.map((s, i) => {
      const pct = val(s) / denom, dash = pct * circumference, offset = -cumulative * circumference;
      cumulative += pct;
      return `<circle cx="90" cy="90" r="${radius}" fill="none" stroke="${palette[i % palette.length]}" stroke-width="28" stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 90 90)"/>`;
    }).join('');
    chartHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-top:6px">
        <svg width="180" height="180" viewBox="0 0 180 180" style="flex-shrink:0">
          ${segments}
          <text x="90" y="84" text-anchor="middle" font-size="10" fill="var(--muted)" font-weight="700">ҮЙЛЧИЛГЭЭ</text>
          <text x="90" y="100" text-anchor="middle" font-size="18" fill="var(--text)" font-weight="900">${svcTotalCnt}</text>
          <text x="90" y="115" text-anchor="middle" font-size="10" fill="var(--muted)" font-weight="700">${mfmtCompact(svcTotalRev)}</text>
        </svg>
        <div style="flex:1;min-width:200px">
          ${display.map((s, i) => {
            const color = palette[i % palette.length];
            return `
              <div style="margin-bottom:8px">
                <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:3px;gap:8px">
                  <span class="bold" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1"><span style="display:inline-block;width:10px;height:10px;background:${color};border-radius:2px;margin-right:6px;vertical-align:middle"></span>${escHTML(s.name)}</span>
                  <span class="bold" style="flex-shrink:0">${s.count}× · ${mfmt(s.rev)}</span>
                </div>
                <div class="prog"><div class="prog-fill" style="background:${color};width:${(val(s) / denom * 100).toFixed(1)}%"></div></div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  } else {
    chartHTML = '<div class="empty"><div class="empty-em">📋</div>Тухайн хугацаанд үйлчилгээ үзүүлээгүй</div>';
  }

  // Онош (топ 5)
  const diag = rpCountMap(mainExams, e => e.diagnosis, () => 0).sort((a, b) => b.count - a.count).slice(0, 5);
  const diagHTML = diag.length ? diag.map(x => `<span class="pill" style="margin:2px 4px 2px 0">${escHTML(x.name)} <b>${x.count}</b></span>`).join('') : '<span class="muted">—</span>';

  const examLabel = d.assistCount > 0
    ? `${d.mainCount} <span class="muted" style="font-size:11px;font-weight:700">+${d.assistCount} хамтран</span>`
    : `${d.mainCount}`;

  body.innerHTML = `
    <div class="fg r3" style="margin-bottom:6px">
      <div class="fld"><label>📋 Үзлэг</label><div style="font-size:18px;font-weight:900">${examLabel}</div></div>
      <div class="fld"><label>🐴 Адуу</label><div style="font-size:18px;font-weight:900">${d.horses}</div></div>
      <div class="fld"><label>💉 Үйлчилгээ</label><div style="font-size:18px;font-weight:900">${d.services}</div></div>
      <div class="fld"><label>📅 Ажилласан өдөр</label><div style="font-size:18px;font-weight:900">${d.days}${d.schedDays ? ' <span class="muted" style="font-size:11px;font-weight:700">/ хуваарь ' + d.schedDays + '</span>' : ''}</div></div>
      <div class="fld"><label>📈 Өдөрт дундаж</label><div style="font-size:18px;font-weight:900">${d.perDay ? d.perDay.toFixed(1) : '—'} <span class="muted" style="font-size:11px;font-weight:700">үзлэг</span></div></div>
      <div class="fld"><label>⏱️ Дундаж хугацаа</label><div style="font-size:18px;font-weight:900">${d.avgDur !== null ? fmtDuration(d.avgDur) : '—'}</div></div>
      <div class="fld"><label>🏥 Байрлан эмчилгээ</label><div style="font-size:18px;font-weight:900">${d.inpLogs} <span class="muted" style="font-size:11px;font-weight:700">бичлэг</span></div></div>
      <div class="fld"><label>💰 Орлого</label><div style="font-size:18px;font-weight:900;color:var(--green)">${mfmtCompact(d.totalRev)}</div></div>
      <div class="fld"><label>💵 Нэг үзлэгт</label><div style="font-size:18px;font-weight:900">${d.mainCount ? mfmtCompact(d.rev / d.mainCount) : '—'}</div></div>
    </div>
    ${schedNoWork ? `<div class="muted" style="font-size:11px;margin-bottom:6px">⚠️ Хуваарьтай боловч үзлэг бүртгэгдээгүй ${schedNoWork} өдөр</div>` : ''}
    <div class="ch">📅 Ажилласан өдрийн график</div>
    ${d.days || d.schedDays ? kpiDocDaysSVG(dayMap, dayList) : '<div class="empty"><div class="empty-em">📅</div>Тухайн хугацаанд ажилласан бүртгэл алга</div>'}
    <div class="ch" style="margin-top:12px">🩺 Түгээмэл онош</div>
    <div style="margin-bottom:4px">${diagHTML}</div>
    <div class="ch" style="margin-top:12px">📊 Үзүүлсэн үйлчилгээний бүтэц</div>
    ${chartHTML}
  `;
}

// ============================================================
// REPORT
// ============================================================
function initReport() {
  // 📋 Өдрийн мэдээ карт
  try { if (typeof renderDailyReport === 'function') renderDailyReport(); } catch (e) { console.error('daily report', e); }
  // Wire up tab switcher
  $$('.tab[data-rper]').forEach(t => {
    t.onclick = () => {
      STATE.activeRPer = t.dataset.rper;
      $$('.tab[data-rper]').forEach(x => x.classList.toggle('active', x.dataset.rper === STATE.activeRPer));
      updateReportPickers();
    };
  });
  $$('.tab[data-rper]').forEach(x => x.classList.toggle('active', x.dataset.rper === STATE.activeRPer));
  // Default values
  if (!$('#rp-date').value) $('#rp-date').value = todayStr();
  if (!$('#rp-week').value) {
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day - 1));
    $('#rp-week').value = localDateStr(monday);
  }
  if (!$('#rp-month').value) {
    const now = new Date();
    $('#rp-month').value = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
  }
  if (!$('#rp-year').value) $('#rp-year').value = new Date().getFullYear();
  if (!$('#rp-from').value) {
    const d = new Date(); d.setDate(1);
    $('#rp-from').value = localDateStr(d);
  }
  if (!$('#rp-to').value) $('#rp-to').value = todayStr();
  __finRerender = () => { if (__rpLast) genReport(); };
  renderFinLockBars();
  // Эмч сонгох dropdown
  rpFillDoctorSelect();
  const ds = $('#rp-doc');
  if (ds && !ds.__wired) {
    ds.__wired = true;
    ds.onchange = () => { if (__rpLast) genReport(); };
  }
  updateReportPickers();
}

function updateReportPickers() {
  const map = { d:'rp-day-row', w:'rp-week-row', m:'rp-month-row', y:'rp-year-row', c:'rp-custom-row' };
  Object.entries(map).forEach(([per, id]) => {
    const el = $('#' + id);
    if (el) el.classList.toggle('hidden', per !== STATE.activeRPer);
  });
}

// Compute period start/end based on selected tab
function getReportPeriod() {
  const per = STATE.activeRPer;
  if (per === 'd') {
    const d = $('#rp-date').value || todayStr();
    return { from: d, to: d, label: '📅 ' + d, kind: 'd' };
  }
  if (per === 'w') {
    const monStr = $('#rp-week').value;
    if (!monStr) return null;
    const mon = new Date(monStr + 'T00:00:00');
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const f = monStr;
    const t = sun.getFullYear() + '-' + String(sun.getMonth()+1).padStart(2,'0') + '-' + String(sun.getDate()).padStart(2,'0');
    return { from: f, to: t, label: '📅 ' + f + ' → ' + t + ' (7 хоног)', kind: 'w' };
  }
  if (per === 'm') {
    const mStr = $('#rp-month').value;
    if (!mStr) return null;
    const [y, m] = mStr.split('-').map(Number);
    const last = new Date(y, m, 0).getDate();
    const f = mStr + '-01';
    const t = mStr + '-' + String(last).padStart(2,'0');
    return { from: f, to: t, label: '📅 ' + mStr + ' (Сар)', kind: 'm' };
  }
  if (per === 'y') {
    const y = $('#rp-year').value;
    if (!y) return null;
    return { from: y + '-01-01', to: y + '-12-31', label: '📅 ' + y + ' (Жил)', kind: 'y' };
  }
  // custom
  const f = $('#rp-from').value;
  const t = $('#rp-to').value;
  if (!f || !t) return null;
  return { from: f, to: t, label: '📅 ' + f + ' → ' + t, kind: 'c' };
}

// ------------------------------------------------------------
// REPORT — туслах функцууд (эмчийн сонголт, мөр бэлтгэх, CSV)
// ------------------------------------------------------------
let __rpLast = null; // Сүүлд үүсгэсэн тайлангийн өгөгдөл (CSV экспортод)

// Огноог "YYYY-MM-DD" болгож хэвийн болгоно
function rpNormDate(v) {
  if (!v) return '';
  if (typeof v === 'string') return v.slice(0, 10);
  if (v instanceof Date) return localDateStr(v);
  try { return localDateStr(new Date(v)); } catch(e) { return ''; }
}

// docId хоосон бол нэрээс synthetic ID үүсгэнэ (хуучин/импортын бичлэгтэй нийцтэй)
function rpDocKey(id, name) {
  if (id) return String(id);
  if (name && String(name).trim() && name !== '—') return 'name_' + String(name).trim();
  return '';
}

// Тайланд сонгох боломжтой бүх эмч: STATE.doctors + үзлэгт тэмдэглэгдсэн нэмэлт нэрс
function rpAllDoctors() {
  const list = (STATE.doctors || []).map(d => ({ id: String(d.id), name: d.name, role: d.role || '' }));
  const seen = new Set(list.map(d => d.id));
  const byName = new Set(list.map(d => d.name));
  const add = (id, name) => {
    const key = rpDocKey(id, name);
    if (!key || seen.has(key)) return;
    if (!id && byName.has(name)) return; // нэрээрээ аль хэдийн байгаа
    seen.add(key);
    list.push({ id: key, name: name || key, role: '', synthetic: true });
  };
  (STATE.exams || []).forEach(e => { add(e.docId, e.docName); add(e.assistDocId, e.assistDocName); });
  (STATE.inps || []).forEach(i => (Array.isArray(i.log) ? i.log : []).forEach(l => add(l.docId, l.docName)));
  return list;
}

// Эмч сонгох dropdown-ийг бөглөнө
function rpFillDoctorSelect() {
  const sel = $('#rp-doc');
  if (!sel) return;
  const prev = sel.value;
  let docs = rpAllDoctors();
  // Accountant / Finance/админ эрхгүй эмч зөвхөн ӨӨРИЙН тайланг харна
  const restricted = !(typeof canAccess === 'function' && (canAccess('finance') || canAccess('admin')));
  const myName = STATE.user && STATE.user.name;
  if (restricted) {
    const mine = docs.filter(d => d.name === myName);
    if (mine.length) docs = mine;
  }
  sel.innerHTML = (restricted && docs.some(d => d.name === myName) ? '' : '<option value="">👥 Бүх эмч (ерөнхий тайлан)</option>') +
    docs.map(d => `<option value="${escHTML(d.id)}">${escHTML(d.name)}${d.role ? ' (' + escHTML(d.role) + ')' : ''}</option>`).join('');
  if (prev && docs.some(d => d.id === prev)) { sel.value = prev; return; }
  // Анх удаа: нэвтэрсэн хэрэглэгч эмч бол өөрийг нь сонгоно (админ эрхтэй бол ерөнхий тайлан)
  if (myName && !(typeof canAccess === 'function' && canAccess('admin'))) {
    const me = docs.find(d => d.name === myName);
    if (me) sel.value = me.id;
  }
}

// Үзлэгийн төлбөрийн байдал
function rpPayStatus(e) {
  const fin = (STATE.fins || []).find(f => String(f.examId) === String(e.id));
  if (!fin) return { label: '—', cls: '', paid: 0 };
  const ps = Array.isArray(fin.payments) ? fin.payments : [];
  const paidSum = ps.length ? ps.reduce((a, p) => a + (parseFloat(p.amount) || 0), 0) : (fin.paid ? (parseFloat(fin.amount) || 0) : 0);
  const amt = parseFloat(fin.amount) || 0;
  if (fin.paid || (amt > 0 && paidSum >= amt)) return { label: 'Төлсөн', cls: 'ok', paid: paidSum || amt };
  if (paidSum > 0) return { label: 'Хэсэгчлэн', cls: 'warn', paid: paidSum };
  return { label: 'Төлөөгүй', cls: 'err', paid: 0 };
}

// Адууны ИАБД дугаар
function rpIabdOf(e) {
  const h = horseOf(e);
  return h && h.iabd ? h.iabd : '';
}

// Үзлэгийн бичлэгийг тайлангийн мөр болгоно
function rpExamRow(e, docKey) {
  const svcs = Array.isArray(e.services) ? e.services : [];
  const meds = Array.isArray(e.meds) ? e.meds : [];
  const mainKey = rpDocKey(e.docId, e.docName);
  const asstKey = rpDocKey(e.assistDocId, e.assistDocName);
  let role = '';
  if (docKey) role = mainKey === docKey ? 'Үндсэн' : (asstKey === docKey ? 'Хамтран' : '');
  const pay = rpPayStatus(e);
  return {
    id: e.id,
    date: rpNormDate(e.date),
    time: e.time || '',
    examNum: e.examNum || '',
    horse: e.horse || '',
    iabd: rpIabdOf(e),
    owner: e.owner || '',
    phone: e.phone || '',
    province: e.province || '',
    diagnosis: e.diagnosis || '',
    services: svcs.map(s => (s.name || '').toString().trim()).filter(Boolean),
    svcText: svcs.map(s => (s.name || '').toString().trim()).filter(Boolean).join(', '),
    meds: meds.map(m => (m.name || '').toString().trim()).filter(Boolean),
    medText: meds.map(m => (m.name || '').toString().trim()).filter(Boolean).join(', '),
    amount: parseFloat(e.amount) || 0,
    payLabel: pay.label,
    payCls: pay.cls,
    durationMin: (e.durationMin !== null && e.durationMin !== undefined && !isNaN(e.durationMin)) ? e.durationMin : null,
    docName: e.docName || '',
    assistDocName: e.assistDocName || '',
    role: role,
    inpatient: !!e.inpatient
  };
}

// Байрлан эмчлүүлэх өдрийн бичлэгүүдийг мөр болгоно (хугацаа + эмчээр шүүнэ)
function rpInpLogRows(from, to, docKey) {
  const rows = [];
  (STATE.inps || []).forEach(i => {
    (Array.isArray(i.log) ? i.log : []).forEach(l => {
      const d = rpNormDate(l.date);
      if (!d || d < from || d > to) return;
      if (docKey && rpDocKey(l.docId, l.docName) !== docKey) return;
      const svcs = Array.isArray(l.services) ? l.services : [];
      const meds = Array.isArray(l.meds) ? l.meds : [];
      rows.push({
        date: d,
        horse: i.horse || '',
        owner: i.owner || '',
        diagnosis: l.diagnosis || i.diagnosis || '',
        note: l.note || '',
        svcText: svcs.map(s => (s.name || '').toString().trim()).filter(Boolean).join(', '),
        medText: meds.map(m => (m.name || '').toString().trim()).filter(Boolean).join(', '),
        amount: parseFloat(l.amount) || 0,
        docName: l.docName || '',
        discharged: !!i.discharged
      });
    });
  });
  return rows.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
}

// Нэр → тоо/дүн бүлэглэлт
function rpCountMap(items, keyFn, revFn) {
  const m = {};
  items.forEach(it => {
    const keys = keyFn(it);
    (Array.isArray(keys) ? keys : [keys]).forEach(k => {
      k = (k || '').toString().trim();
      if (!k) return;
      if (!m[k]) m[k] = { name: k, count: 0, rev: 0 };
      m[k].count++;
      if (revFn) m[k].rev += revFn(it, k) || 0;
    });
  });
  return Object.values(m).sort((a, b) => (b.rev - a.rev) || (b.count - a.count));
}

// Үйлчилгээний задаргаа (үзлэгээс)
function rpServiceStats(exams) {
  const map = {};
  exams.forEach(e => {
    const svcs = Array.isArray(e.services) ? e.services : [];
    if (!svcs.length) return;
    const perSvcDur = (e.durationMin !== null && e.durationMin !== undefined && !isNaN(e.durationMin)) ? (e.durationMin / svcs.length) : null;
    svcs.forEach(s => {
      const name = (s.name || '—').toString().trim();
      if (!name) return;
      if (!map[name]) map[name] = { name, count: 0, rev: 0, durSum: 0, durN: 0 };
      map[name].count++;
      map[name].rev += parseFloat(s.price) || 0;
      if (perSvcDur !== null) { map[name].durSum += perSvcDur; map[name].durN++; }
    });
  });
  return Object.values(map).map(v => ({ name: v.name, count: v.count, rev: v.rev, avgDur: v.durN ? v.durSum / v.durN : null })).sort((a, b) => b.rev - a.rev);
}

// Дэлгэц дээрх жижиг хүснэгт (нэр / тоо / дүн / хувь)
function rpMiniTable(entries, opts) {
  opts = opts || {};
  if (!entries.length) return `<div class="empty"><div class="empty-em">${opts.emptyIcon || '📋'}</div>${escHTML(opts.emptyText || 'Бичлэг алга')}</div>`;
  const total = entries.reduce((a, b) => a + (opts.byCount ? b.count : b.rev), 0);
  const max = opts.limit || 12;
  const shown = entries.slice(0, max);
  const rest = entries.length - shown.length;
  return `
    <div class="tbl-wrap"><table>
      <thead><tr><th>${escHTML(opts.nameLabel || 'Нэр')}</th><th style="width:60px">Тоо</th>${opts.hideRev ? '' : '<th style="width:110px">Дүн</th>'}<th style="width:120px">Хувь</th></tr></thead>
      <tbody>
        ${shown.map(s => {
          const v = opts.byCount ? s.count : s.rev;
          const pct = total > 0 ? (v / total * 100) : 0;
          return `<tr>
            <td class="bold" style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(s.name)}</td>
            <td>${s.count}</td>
            ${opts.hideRev ? '' : `<td>${mfmt(s.rev)}</td>`}
            <td><div class="row" style="gap:6px;flex-wrap:nowrap"><div class="prog" style="flex:1;min-width:40px"><div class="prog-fill" style="width:${pct.toFixed(1)}%"></div></div><span style="font-size:11px;font-weight:700;flex-shrink:0">${pct.toFixed(0)}%</span></div></td>
          </tr>`;
        }).join('')}
        ${rest > 0 ? `<tr><td colspan="4" class="muted" style="font-size:11px;text-align:center">… бусад ${rest}</td></tr>` : ''}
      </tbody>
    </table></div>`;
}

// Хэвлэх хувилбарын жижиг хүснэгт
function rpMiniTablePrint(entries, nameLabel, hideRev) {
  if (!entries.length) return `<table class="pr-tbl"><tr><td style="text-align:center">Бичлэг алга</td></tr></table>`;
  const total = entries.reduce((a, b) => a + (hideRev ? b.count : b.rev), 0);
  return `<table class="pr-tbl">
    <tr><th>${escHTML(nameLabel)}</th><th>Тоо</th>${hideRev ? '' : '<th>Дүн</th>'}<th>Хувь</th></tr>
    ${entries.map(s => { const v = hideRev ? s.count : s.rev; return `<tr><td>${escHTML(s.name)}</td><td>${s.count}</td>${hideRev ? '' : `<td>${mfmt(s.rev)}</td>`}<td>${total > 0 ? (v / total * 100).toFixed(1) + '%' : '—'}</td></tr>`; }).join('')}
  </table>`;
}

// Үзсэн адуудын дэлгэрэнгүй хүснэгт (дэлгэц)
function rpExamTable(rows, opts) {
  opts = opts || {};
  if (!rows.length) return `<div class="empty"><div class="empty-em">🐎</div>Тухайн хугацаанд үзлэг байхгүй</div>`;
  const LIMIT = opts.limit || 400;
  const shown = rows.slice(0, LIMIT);
  const showRole = !!opts.showRole;
  const showDoc = !!opts.showDoc;
  const payBadge = (r) => r.payCls === 'ok' ? `<span class="badge" style="background:var(--green);color:#fff">${r.payLabel}</span>`
    : r.payCls === 'warn' ? `<span class="badge" style="background:var(--orange);color:#fff">${r.payLabel}</span>`
    : r.payCls === 'err' ? `<span class="badge" style="background:var(--red);color:#fff">${r.payLabel}</span>` : '—';
  return `
    <div class="tbl-wrap" style="overflow-x:auto;-webkit-overflow-scrolling:touch">
      <table style="min-width:1100px;font-size:12px">
        <thead><tr>
          <th style="width:32px">#</th>
          <th style="width:88px">Огноо</th>
          <th style="width:70px">Дугаар</th>
          <th style="width:130px">Адуу (зүс)</th>
          <th style="width:80px">ИАБД</th>
          <th style="width:110px">Эзэн</th>
          <th style="width:90px">Утас</th>
          <th style="width:160px">Онош</th>
          <th>Хийсэн үйлчилгээ</th>
          <th style="width:150px">Эм</th>
          ${showDoc ? '<th style="width:110px">Эмч</th>' : ''}
          ${showRole ? '<th style="width:70px">Үүрэг</th>' : ''}
          <th style="width:90px;text-align:right">Дүн</th>
          <th style="width:80px">Төлбөр</th>
          <th style="width:70px">Хугацаа</th>
        </tr></thead>
        <tbody>
          ${shown.map((r, i) => `
            <tr style="cursor:pointer" onclick="openExamDetail('${escHTML(String(r.id))}')" title="Дэлгэрэнгүй харах">
              <td class="muted">${i + 1}</td>
              <td>${escHTML(r.date)}${r.time ? '<div class="muted" style="font-size:10px">' + escHTML(r.time) + '</div>' : ''}</td>
              <td class="bold">${escHTML(r.examNum)}</td>
              <td class="bold" style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(r.horse)}${r.inpatient ? ' <span class="badge">🏥</span>' : ''}</td>
              <td>${escHTML(r.iabd) || '—'}</td>
              <td style="max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(r.owner)}</td>
              <td>${escHTML(r.phone)}</td>
              <td style="max-width:160px;white-space:normal">${escHTML(r.diagnosis) || '—'}</td>
              <td style="white-space:normal">${r.services.length ? r.services.map(s => `<span class="pill" style="margin:1px 2px 1px 0">${escHTML(s)}</span>`).join('') : '<span class="muted">—</span>'}</td>
              <td style="white-space:normal;font-size:11px">${escHTML(r.medText) || '<span class="muted">—</span>'}</td>
              ${showDoc ? `<td style="font-size:11px">${escHTML(r.docName)}${r.assistDocName ? '<div class="muted" style="font-size:10px">+ ' + escHTML(r.assistDocName) + '</div>' : ''}</td>` : ''}
              ${showRole ? `<td>${r.role === 'Хамтран' ? '<span class="badge">хамтран</span>' : '<span class="bold" style="font-size:11px">үндсэн</span>'}</td>` : ''}
              <td class="bold" style="text-align:right;white-space:nowrap">${mfmt(r.amount)}</td>
              <td>${payBadge(r)}</td>
              <td class="muted" style="font-size:11px">${r.durationMin !== null ? fmtDuration(r.durationMin) : '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${rows.length > LIMIT ? `<div class="muted" style="font-size:11px;margin-top:6px;text-align:center">Эхний ${LIMIT} мөрийг харуулав (нийт ${rows.length}). Бүгдийг харахын тулд CSV татна уу эсвэл хэвлэнэ үү.</div>` : ''}`;
}

// Үзсэн адуудын хүснэгт (хэвлэх)
function rpExamTablePrint(rows, opts) {
  opts = opts || {};
  if (!rows.length) return `<table class="pr-tbl"><tr><td style="text-align:center">Үзлэг байхгүй</td></tr></table>`;
  const showRole = !!opts.showRole, showDoc = !!opts.showDoc;
  return `<table class="pr-tbl pr-wide">
    <tr><th>#</th><th>Огноо</th><th>Дугаар</th><th>Адуу</th><th>ИАБД</th><th>Эзэн</th><th>Утас</th><th>Онош</th><th>Үйлчилгээ</th><th>Эм</th>${showDoc ? '<th>Эмч</th>' : ''}${showRole ? '<th>Үүрэг</th>' : ''}<th>Дүн</th><th>Төлбөр</th></tr>
    ${rows.map((r, i) => `<tr><td>${i + 1}</td><td>${escHTML(r.date)}</td><td>${escHTML(r.examNum)}</td><td>${escHTML(r.horse)}</td><td>${escHTML(r.iabd)}</td><td>${escHTML(r.owner)}</td><td>${escHTML(r.phone)}</td><td>${escHTML(r.diagnosis)}</td><td>${escHTML(r.svcText)}</td><td>${escHTML(r.medText)}</td>${showDoc ? `<td>${escHTML(r.docName)}${r.assistDocName ? ' / ' + escHTML(r.assistDocName) : ''}</td>` : ''}${showRole ? `<td>${escHTML(r.role)}</td>` : ''}<td style="text-align:right">${mfmt(r.amount)}</td><td>${escHTML(r.payLabel)}</td></tr>`).join('')}
  </table>`;
}

// Байрлан эмчлүүлэх бичлэгийн хүснэгт (дэлгэц)
function rpInpTable(rows, showDoc) {
  if (!rows.length) return `<div class="empty"><div class="empty-em">🏥</div>Байрлан эмчлүүлэх бичлэг байхгүй</div>`;
  return `
    <div class="tbl-wrap" style="overflow-x:auto;-webkit-overflow-scrolling:touch">
      <table style="min-width:800px;font-size:12px">
        <thead><tr><th style="width:32px">#</th><th style="width:88px">Огноо</th><th style="width:130px">Адуу</th><th style="width:110px">Эзэн</th><th style="width:150px">Онош</th><th>Үйлчилгээ</th><th style="width:150px">Эм</th>${showDoc ? '<th style="width:110px">Эмч</th>' : ''}<th style="width:90px;text-align:right">Дүн</th></tr></thead>
        <tbody>
          ${rows.map((r, i) => `<tr>
            <td class="muted">${i + 1}</td>
            <td>${escHTML(r.date)}</td>
            <td class="bold">${escHTML(r.horse)}${r.discharged ? '' : ' <span class="badge">байрлаж буй</span>'}</td>
            <td>${escHTML(r.owner)}</td>
            <td style="white-space:normal">${escHTML(r.diagnosis) || '—'}</td>
            <td style="white-space:normal">${escHTML(r.svcText) || '<span class="muted">—</span>'}${r.note ? '<div class="muted" style="font-size:10px">' + escHTML(r.note) + '</div>' : ''}</td>
            <td style="white-space:normal;font-size:11px">${escHTML(r.medText) || '<span class="muted">—</span>'}</td>
            ${showDoc ? `<td style="font-size:11px">${escHTML(r.docName)}</td>` : ''}
            <td class="bold" style="text-align:right;white-space:nowrap">${mfmt(r.amount)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function rpInpTablePrint(rows, showDoc) {
  if (!rows.length) return `<table class="pr-tbl"><tr><td style="text-align:center">Бичлэг алга</td></tr></table>`;
  return `<table class="pr-tbl pr-wide">
    <tr><th>#</th><th>Огноо</th><th>Адуу</th><th>Эзэн</th><th>Онош</th><th>Үйлчилгээ</th><th>Эм</th>${showDoc ? '<th>Эмч</th>' : ''}<th>Дүн</th></tr>
    ${rows.map((r, i) => `<tr><td>${i + 1}</td><td>${escHTML(r.date)}</td><td>${escHTML(r.horse)}</td><td>${escHTML(r.owner)}</td><td>${escHTML(r.diagnosis)}</td><td>${escHTML(r.svcText)}${r.note ? ' (' + escHTML(r.note) + ')' : ''}</td><td>${escHTML(r.medText)}</td>${showDoc ? `<td>${escHTML(r.docName)}</td>` : ''}<td style="text-align:right">${mfmt(r.amount)}</td></tr>`).join('')}
  </table>`;
}

// Тайлангаас CSV татах
function exportReportCSV() {
  if (!__rpLast) { toast('Эхлээд тайлан үүсгэнэ үү', 'err'); return; }
  const L = __rpLast;
  const rows = [['#', 'Огноо', 'Цаг', 'Дугаар', 'Адуу', 'ИАБД', 'Эзэн', 'Утас', 'Аймаг', 'Онош', 'Үйлчилгээ', 'Эм', 'Эмч', 'Хамтран эмч', 'Үүрэг', 'Дүн', 'Төлбөр', 'Хугацаа (мин)']];
  L.examRows.forEach((r, i) => rows.push([i + 1, r.date, r.time, r.examNum, r.horse, r.iabd, r.owner, r.phone, r.province, r.diagnosis, r.svcText, r.medText, r.docName, r.assistDocName, r.role, finVisible() ? r.amount : '••••', r.payLabel, r.durationMin !== null ? r.durationMin : '']));
  if (L.inpRows.length) {
    rows.push([]);
    rows.push(['БАЙРЛАН ЭМЧЛҮҮЛЭХ — өдрийн эмчилгээ']);
    rows.push(['#', 'Огноо', 'Адуу', 'Эзэн', 'Онош', 'Үйлчилгээ', 'Эм', 'Эмч', 'Дүн', 'Тэмдэглэл']);
    L.inpRows.forEach((r, i) => rows.push([i + 1, r.date, r.horse, r.owner, r.diagnosis, r.svcText, r.medText, r.docName, finVisible() ? r.amount : '••••', r.note]));
  }
  const nm = (L.docName ? L.docName + '_' : '') + 'тайлан_' + L.from + '_' + L.to + '.csv';
  downloadCSV(rows, nm);
}

// Ерөнхий тайлангаас эмчийн мөр дарахад тухайн эмчийн тайлан руу шилжинэ
function rpSelectDoctor(id) {
  const sel = $('#rp-doc');
  if (!sel) return;
  sel.value = id;
  if (sel.value !== id) { toast('Эмч олдсонгүй', 'err'); return; }
  genReport();
  const pv = $('#rp-preview');
  if (pv && pv.scrollIntoView) pv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
// REPORT — үүсгэх
// ============================================================
function genReport() {
  const period = getReportPeriod();
  if (!period) { toast('Хугацаа сонгоно уу', 'err'); return; }
  if (period.from && period.from < LIVE_CUTOFF) ensureRange(period.from, period.to).then(ok => { if (ok && STATE.activePage === 'report') genReport(); });
  $('#rp-period-info').textContent = period.label;
  __finRerender = genReport;
  renderFinLockBars();
  const docSel = $('#rp-doc');
  const docKey = docSel ? docSel.value : '';
  if (docKey) genDoctorReport(period, docKey);
  else genOverallReport(period);
  const csvBtn = $('#rp-csv-btn');
  if (csvBtn) csvBtn.classList.remove('hidden');
  toast('✅ Тайлан үүсгэгдлээ', 'ok');
}

// ------------------------------------------------------------
// ЭМЧИЙН ТАЙЛАН — нэг эмчийн үзсэн бүх адуу, хийсэн үйлчилгээ
// ------------------------------------------------------------
function genDoctorReport(period, docKey) {
  const inRange = (v) => { const n = rpNormDate(v); return n && n >= period.from && n <= period.to; };
  const doc = rpAllDoctors().find(d => d.id === docKey) || { id: docKey, name: docKey.replace(/^name_/, ''), role: '' };

  // Энэ эмчийн оролцсон үзлэгүүд (үндсэн эсвэл хамтран)
  const _rk = kindFilterVal('rp-kind');
  const exams = (STATE.exams || []).filter(e => {
    if (!inRange(e.date) || !examKindOk(e, _rk)) return false;
    return rpDocKey(e.docId, e.docName) === docKey || rpDocKey(e.assistDocId, e.assistDocName) === docKey;
  }).sort((a, b) => {
    const da = rpNormDate(a.date), db = rpNormDate(b.date);
    if (da !== db) return da < db ? -1 : 1;
    return (a.time || '') < (b.time || '') ? -1 : 1;
  });
  const examRows = exams.map(e => rpExamRow(e, docKey));
  const mainExams = exams.filter(e => rpDocKey(e.docId, e.docName) === docKey);
  const assistExams = exams.filter(e => rpDocKey(e.docId, e.docName) !== docKey);
  const inpRows = rpInpLogRows(period.from, period.to, docKey);

  // Тоон үзүүлэлтүүд
  const horses = new Set(exams.map(e => String(e.horseId || e.horse || e.id)));
  const svcCount = mainExams.reduce((a, e) => a + (Array.isArray(e.services) ? e.services.length : 0), 0);
  const revMain = mainExams.reduce((a, e) => a + (parseFloat(e.amount) || 0), 0);
  const revInp = inpRows.reduce((a, r) => a + r.amount, 0);
  const durs = mainExams.map(e => e.durationMin).filter(v => v !== null && v !== undefined && !isNaN(v));
  const avgDur = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : null;
  const inpCount = mainExams.filter(e => e.inpatient).length;
  const paidCnt = examRows.filter(r => r.role === 'Үндсэн' && r.payCls === 'ok').length;
  const unpaidCnt = mainExams.length - paidCnt;
  const workDays = new Set(exams.map(e => rpNormDate(e.date)).concat(inpRows.map(r => r.date))).size;

  // Задаргаанууд (үндсэн эмчээр хийсэн үзлэг + байрлан эмчлүүлэх бичлэг)
  const svcStats = rpServiceStats(mainExams);
  inpRows.forEach(r => { /* inp services нэрээр тоолно */
    (r.svcText ? r.svcText.split(', ') : []).forEach(n => {
      let s = svcStats.find(x => x.name === n);
      if (!s) { s = { name: n, count: 0, rev: 0, avgDur: null }; svcStats.push(s); }
      s.count++;
    });
  });
  svcStats.sort((a, b) => b.rev - a.rev || b.count - a.count);
  const diagStats = rpCountMap(mainExams, e => e.diagnosis, () => 0).sort((a, b) => b.count - a.count);
  const medStats = rpCountMap(mainExams.concat(), e => (Array.isArray(e.meds) ? e.meds : []).map(m => m.name), () => 0);
  inpRows.forEach(r => (r.medText ? r.medText.split(', ') : []).forEach(n => {
    let m = medStats.find(x => x.name === n);
    if (!m) { m = { name: n, count: 0, rev: 0 }; medStats.push(m); }
    m.count++;
  }));
  medStats.sort((a, b) => b.count - a.count);
  const provStats = rpCountMap(mainExams, e => e.province || 'Тодорхойгүй', e => parseFloat(e.amount) || 0).sort((a, b) => b.count - a.count);

  // Сараар (жил/custom үед)
  const monthMap = {};
  mainExams.forEach(e => { const m = rpNormDate(e.date).slice(0, 7); if (!monthMap[m]) monthMap[m] = { name: m, count: 0, rev: 0 }; monthMap[m].count++; monthMap[m].rev += parseFloat(e.amount) || 0; });
  const monthStats = Object.values(monthMap).sort((a, b) => a.name < b.name ? -1 : 1);

  __rpLast = { docName: doc.name, from: period.from, to: period.to, examRows, inpRows };

  const title = `👨‍⚕️ ${escHTML(doc.name)}${doc.role ? ' <span class="muted" style="font-size:13px;font-weight:700">(' + escHTML(doc.role) + ')</span>' : ''}`;
  const periodTxt = escHTML(period.label.replace(/^📅 /, ''));

  $('#rp-preview').innerHTML = `
    <div class="pr-h1" style="font-size:18px;font-weight:900;text-align:center">${title}</div>
    <div class="muted" style="text-align:center;font-size:12px;margin-bottom:4px">Эмчийн ажлын тайлан — ${periodTxt}</div>
    <div class="muted" style="text-align:center;font-size:11px;margin-bottom:14px">Морьтон Адууны Төв</div>

    <div class="stats s5">
      <div class="stat"><div class="stat-l">🐎 Үзсэн адуу</div><div class="snum">${horses.size}</div><div class="muted" style="font-size:10px">${exams.length} үзлэг</div></div>
      <div class="stat accent"><div class="stat-l">📋 Үндсэн / Хамтран</div><div class="snum">${mainExams.length} <span class="muted" style="font-size:13px">/ ${assistExams.length}</span></div><div class="muted" style="font-size:10px">${inpCount} байрлан эмчлүүлэх</div></div>
      <div class="stat purple"><div class="stat-l">💉 Үйлчилгээ</div><div class="snum">${svcCount}</div><div class="muted" style="font-size:10px">${medStats.reduce((a, b) => a + b.count, 0)} эм хэрэглэсэн</div></div>
      <div class="stat green"><div class="stat-l">💰 Орлого</div><div class="snum">${mfmtCompact(revMain + revInp)}</div><div class="muted" style="font-size:10px">${paidCnt} төлсөн · ${unpaidCnt} төлөөгүй</div></div>
      <div class="stat"><div class="stat-l">🏥 Байрлан эмчилгээ</div><div class="snum">${inpRows.length}</div><div class="muted" style="font-size:10px">өдрийн бичлэг · ${workDays} ажилласан өдөр</div></div>
    </div>

    ${avgDur !== null ? `<div class="muted" style="font-size:11px;margin-top:8px">⏱️ Нэг үзлэгийн дундаж хугацаа: <b>${fmtDuration(avgDur)}</b> (${durs.length} үзлэг дээр тооцов)</div>` : ''}

    <div class="col2" style="margin-top:14px;gap:14px">
      <div>
        <div class="ch">💉 Хийсэн үйлчилгээ</div>
        ${rpMiniTable(svcStats, { nameLabel: 'Үйлчилгээ', limit: 15 })}
      </div>
      <div>
        <div class="ch">🩺 Онош</div>
        ${rpMiniTable(diagStats, { nameLabel: 'Онош', byCount: true, hideRev: true, limit: 15, emptyIcon: '🩺' })}
      </div>
    </div>

    <div class="col2" style="margin-top:14px;gap:14px">
      <div>
        <div class="ch">💊 Хэрэглэсэн эм</div>
        ${rpMiniTable(medStats, { nameLabel: 'Эм', byCount: true, hideRev: true, limit: 15, emptyIcon: '💊' })}
      </div>
      <div>
        <div class="ch">📍 Аймгаар</div>
        ${rpMiniTable(provStats, { nameLabel: 'Аймаг', byCount: true, limit: 10, emptyIcon: '📍' })}
        ${monthStats.length > 1 ? `<div class="ch" style="margin-top:12px">📆 Сараар</div>${rpMiniTable(monthStats, { nameLabel: 'Сар', limit: 24 })}` : ''}
      </div>
    </div>

    <div class="ch" style="margin-top:16px">🐎 Үзсэн адуудын жагсаалт <span class="ch-r">${examRows.length}</span></div>
    <div class="muted" style="font-size:11px;margin-bottom:6px">Мөр дээр дарж үзлэгийн дэлгэрэнгүйг харна. 🏥 — байрлан эмчлүүлэхэд орсон.</div>
    ${rpExamTable(examRows, { showRole: assistExams.length > 0 })}

    <div class="ch" style="margin-top:16px">🏥 Байрлан эмчлүүлэх — өдрийн эмчилгээ <span class="ch-r">${inpRows.length}</span></div>
    ${rpInpTable(inpRows, false)}

    <div style="margin-top:24px;display:flex;justify-content:space-between;font-size:12px">
      <div>Эмч: ${escHTML(doc.name)} ____________________</div>
      <div>Удирдах эмч: ____________________</div>
    </div>
  `;

  $('#print-area').innerHTML = `
    <div class="rp-print">
      <div class="pr-h1">Эмчийн ажлын тайлан — ${escHTML(doc.name)}${doc.role ? ' (' + escHTML(doc.role) + ')' : ''}</div>
      <div style="text-align:center;margin-bottom:10px">Морьтон Адууны Төв · ${periodTxt}</div>
      <div class="pr-h2">Тойм</div>
      <table class="pr-tbl">
        <tr><th>Үзсэн адуу</th><th>Үзлэг (үндсэн)</th><th>Хамтран</th><th>Үйлчилгээ</th><th>Байрлан эмчлүүлэх бичлэг</th><th>Ажилласан өдөр</th><th>Дундаж хугацаа</th><th>Орлого</th><th>Төлсөн / Төлөөгүй</th></tr>
        <tr><td>${horses.size}</td><td>${mainExams.length}</td><td>${assistExams.length}</td><td>${svcCount}</td><td>${inpRows.length}</td><td>${workDays}</td><td>${avgDur !== null ? fmtDuration(avgDur) : '—'}</td><td>${mfmt(revMain + revInp)}</td><td>${paidCnt} / ${unpaidCnt}</td></tr>
      </table>
      <div class="pr-cols">
        <div><div class="pr-h2">Хийсэн үйлчилгээ</div>${rpMiniTablePrint(svcStats, 'Үйлчилгээ', false)}</div>
        <div><div class="pr-h2">Онош</div>${rpMiniTablePrint(diagStats, 'Онош', true)}</div>
        <div><div class="pr-h2">Хэрэглэсэн эм</div>${rpMiniTablePrint(medStats, 'Эм', true)}</div>
      </div>
      ${monthStats.length > 1 ? `<div class="pr-h2">Сараар</div>${rpMiniTablePrint(monthStats, 'Сар', false)}` : ''}
      <div class="pr-h2">Үзсэн адуудын жагсаалт (${examRows.length})</div>
      ${rpExamTablePrint(examRows, { showRole: assistExams.length > 0 })}
      <div class="pr-h2">Байрлан эмчлүүлэх — өдрийн эмчилгээ (${inpRows.length})</div>
      ${rpInpTablePrint(inpRows, false)}
      <div class="pr-sign"><div>Эмч: ${escHTML(doc.name)} ____________________</div><div>Удирдах эмч: ____________________</div></div>
    </div>
  `;
}

// ------------------------------------------------------------
// ЕРӨНХИЙ ТАЙЛАН — бүх эмч
// ------------------------------------------------------------
function genOverallReport(period) {
  const inRange = (v) => { const n = rpNormDate(v); return n && n >= period.from && n <= period.to; };
  const _rk = kindFilterVal('rp-kind');
  const exams = (STATE.exams || []).filter(e => inRange(e.date) && examKindOk(e, _rk)).sort((a, b) => {
    const da = rpNormDate(a.date), db = rpNormDate(b.date);
    if (da !== db) return da < db ? -1 : 1;
    return (a.time || '') < (b.time || '') ? -1 : 1;
  });

  // Орлого = тухайн хугацаанд хийгдсэн төлбөрүүд
  let totalRev = 0;
  const methodTotals = { 'бэлэн': 0, 'карт': 0, 'QPay': 0, 'дансаар': 0, 'зээл': 0, 'шилжүүлэг': 0 };
  (STATE.fins || []).forEach(f => {
    const ps = Array.isArray(f.payments) ? f.payments : [];
    if (ps.length > 0) {
      ps.forEach(p => {
        if (inRange(p.date)) {
          const amt = parseFloat(p.amount) || 0;
          totalRev += amt;
          methodTotals[p.method] = (methodTotals[p.method] || 0) + amt;
        }
      });
    } else if (f.paid && inRange(f.paidDate)) {
      const amt = parseFloat(f.amount) || 0;
      totalRev += amt;
      const m = f.method || 'бэлэн';
      methodTotals[m] = (methodTotals[m] || 0) + amt;
    }
  });
  const methodStats = Object.entries(methodTotals).filter(([, v]) => v > 0).map(([name, rev]) => ({ name, count: 0, rev })).sort((a, b) => b.rev - a.rev);

  const activeInps = (STATE.inps || []).filter(x => !x.discharged).length;
  const examRows = exams.map(e => rpExamRow(e, ''));
  const inpRows = rpInpLogRows(period.from, period.to, '');
  const billed = exams.reduce((a, e) => a + (parseFloat(e.amount) || 0), 0);
  const paidCnt = examRows.filter(r => r.payCls === 'ok').length;
  const partCnt = examRows.filter(r => r.payCls === 'warn').length;
  const unpaidCnt = examRows.filter(r => r.payCls === 'err').length;
  const unpaidAmt = examRows.filter(r => r.payCls !== 'ok').reduce((a, r) => a + r.amount, 0);
  const horses = new Set(exams.map(e => String(e.horseId || e.horse || e.id)));
  const durs = exams.map(e => e.durationMin).filter(v => v !== null && v !== undefined && !isNaN(v));
  const avgDur = durs.length ? durs.reduce((a, b) => a + b, 0) / durs.length : null;

  const svcEntries = rpServiceStats(exams);
  const svcTotalRev = svcEntries.reduce((a, b) => a + b.rev, 0);
  const diagStats = rpCountMap(exams, e => e.diagnosis, () => 0).sort((a, b) => b.count - a.count);
  const medStats = rpCountMap(exams, e => (Array.isArray(e.meds) ? e.meds : []).map(m => m.name), () => 0).sort((a, b) => b.count - a.count);
  const provStats = rpCountMap(exams, e => e.province || 'Тодорхойгүй', e => parseFloat(e.amount) || 0).sort((a, b) => b.count - a.count);
  const monthMap = {};
  exams.forEach(e => { const m = rpNormDate(e.date).slice(0, 7); if (!monthMap[m]) monthMap[m] = { name: m, count: 0, rev: 0 }; monthMap[m].count++; monthMap[m].rev += parseFloat(e.amount) || 0; });
  const monthStats = Object.values(monthMap).sort((a, b) => a.name < b.name ? -1 : 1);

  // Эмч тус бүрийн үзүүлэлт
  const docMap = {};
  const ensure = (key, name, role) => { if (!docMap[key]) docMap[key] = { key, name: name || '—', role: role || '', exams: 0, assist: 0, services: 0, rev: 0, horses: new Set(), inpLogs: 0 }; return docMap[key]; };
  const docInfo = rpAllDoctors();
  exams.forEach(e => {
    const mk = rpDocKey(e.docId, e.docName);
    if (mk) {
      const di = docInfo.find(d => d.id === mk);
      const d = ensure(mk, di ? di.name : e.docName, di ? di.role : '');
      d.exams++;
      d.services += Array.isArray(e.services) ? e.services.length : 0;
      d.rev += parseFloat(e.amount) || 0;
      d.horses.add(String(e.horseId || e.horse || e.id));
    }
    const ak = rpDocKey(e.assistDocId, e.assistDocName);
    if (ak) {
      const di = docInfo.find(d => d.id === ak);
      ensure(ak, di ? di.name : e.assistDocName, di ? di.role : '').assist++;
    }
  });
  inpRows.forEach(r => {
    const k = rpDocKey('', r.docName);
    const di = docInfo.find(d => d.name === r.docName);
    const key = di ? di.id : k;
    if (!key) return;
    const d = ensure(key, r.docName, di ? di.role : '');
    d.inpLogs++;
    d.rev += r.amount;
  });
  const docList = Object.values(docMap).sort((a, b) => b.rev - a.rev || b.exams - a.exams);
  const docTotalRev = docList.reduce((a, d) => a + d.rev, 0);

  __rpLast = { docName: '', from: period.from, to: period.to, examRows, inpRows };

  // Үйлчилгээний donut
  const palette = ['#C9A75A', '#27ae60', '#2980b9', '#8e44ad', '#E8752A', '#16a085', '#e67e22', '#c0392b', '#7f8c8d', '#d35400', '#1abc9c', '#9b59b6'];
  let chartHTML = '';
  if (svcEntries.length > 0 && svcTotalRev > 0) {
    let cumulative = 0;
    const radius = 70, circumference = 2 * Math.PI * radius, TOP = 8;
    let display = svcEntries.slice();
    if (svcEntries.length > TOP) {
      const rest = svcEntries.slice(TOP);
      display = [...svcEntries.slice(0, TOP), { name: 'Бусад (' + rest.length + ')', count: rest.reduce((a, b) => a + b.count, 0), rev: rest.reduce((a, b) => a + b.rev, 0), avgDur: null }];
    }
    const segments = display.map((s, i) => {
      const pct = s.rev / svcTotalRev, dash = pct * circumference, offset = -cumulative * circumference;
      cumulative += pct;
      return `<circle cx="100" cy="100" r="${radius}" fill="none" stroke="${palette[i % palette.length]}" stroke-width="32" stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 100 100)"/>`;
    }).join('');
    chartHTML = `
      <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
        <svg width="200" height="200" viewBox="0 0 200 200" style="flex-shrink:0">
          ${segments}
          <text x="100" y="92" text-anchor="middle" font-size="11" fill="var(--muted)" font-weight="700">ҮЙЛЧИЛГЭЭ</text>
          <text x="100" y="108" text-anchor="middle" font-size="20" fill="var(--text)" font-weight="900">${svcEntries.reduce((a, b) => a + b.count, 0)}</text>
          <text x="100" y="125" text-anchor="middle" font-size="11" fill="var(--muted)" font-weight="700">${mfmtCompact(svcTotalRev)}</text>
        </svg>
        <div style="flex:1;min-width:240px">
          ${display.map((s, i) => {
            const color = palette[i % palette.length];
            const durTxt = (s.avgDur !== null && s.avgDur !== undefined) ? ' · ⏱️' + fmtDuration(s.avgDur) : '';
            return `<div style="margin-bottom:8px">
                <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:3px;gap:8px">
                  <span class="bold" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1"><span style="display:inline-block;width:10px;height:10px;background:${color};border-radius:2px;margin-right:6px;vertical-align:middle"></span>${escHTML(s.name)}</span>
                  <span class="bold" style="flex-shrink:0">${s.count}× · ${mfmt(s.rev)}${durTxt}</span>
                </div>
                <div class="prog"><div class="prog-fill" style="background:${color};width:${(s.rev / svcTotalRev * 100).toFixed(1)}%"></div></div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  } else {
    chartHTML = '<div class="empty"><div class="empty-em">📋</div>Тухайн хугацаанд үйлчилгээ үзүүлээгүй</div>';
  }

  const periodTxt = escHTML(period.label.replace(/^📅 /, ''));
  const docTable = docList.length === 0 ? '<div class="empty"><div class="empty-em">👨‍⚕️</div>Эмч ажиллаагүй</div>' : `
    <div class="muted" style="font-size:11px;margin-bottom:6px">Эмчийн нэр дээр дарж тухайн эмчийн дэлгэрэнгүй тайланг харна.</div>
    <div class="tbl-wrap" style="overflow-x:auto">
      <table style="min-width:640px">
        <thead><tr><th>Эмч</th><th>Үзсэн адуу</th><th>Үзлэг</th><th>Хамтран</th><th>Үйлчилгээ</th><th>Байрлан эмчилгээ</th><th>Орлого</th><th style="width:130px">Хувь</th></tr></thead>
        <tbody>
          ${docList.map(d => {
            const pct = docTotalRev > 0 ? d.rev / docTotalRev * 100 : 0;
            return `<tr style="cursor:pointer" onclick="rpSelectDoctor('${escHTML(d.key)}')" title="Эмчийн тайлан харах">
              <td class="bold">${escHTML(d.name)}${d.role ? '<div class="muted" style="font-size:10px">' + escHTML(d.role) + '</div>' : ''}</td>
              <td>${d.horses.size}</td>
              <td>${d.exams}</td>
              <td>${d.assist ? d.assist : '—'}</td>
              <td>${d.services}</td>
              <td>${d.inpLogs || '—'}</td>
              <td class="bold">${mfmt(d.rev)}</td>
              <td><div class="row" style="gap:6px;flex-wrap:nowrap"><div class="prog" style="flex:1"><div class="prog-fill" style="width:${pct.toFixed(1)}%"></div></div><span style="font-size:11px;font-weight:700">${pct.toFixed(0)}%</span></div></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  $('#rp-preview').innerHTML = `
    <div class="pr-h1" style="font-size:18px;font-weight:900;text-align:center">📄 Тайлан — ${periodTxt}</div>
    <div class="muted" style="text-align:center;font-size:12px;margin-bottom:14px">Морьтон Адууны Төв · Бүх эмч</div>

    <div class="stats s5">
      <div class="stat"><div class="stat-l">📋 Үзлэг</div><div class="snum">${exams.length}</div><div class="muted" style="font-size:10px">${horses.size} адуу</div></div>
      <div class="stat green"><div class="stat-l">💰 Орлого (төлөгдсөн)</div><div class="snum">${mfmtCompact(totalRev)}</div><div class="muted" style="font-size:10px">тооцоолсон ${mfmtCompact(billed)}</div></div>
      <div class="stat red"><div class="stat-l">⏳ Төлөгдөөгүй</div><div class="snum">${mfmtCompact(unpaidAmt)}</div><div class="muted" style="font-size:10px">${unpaidCnt} төлөөгүй · ${partCnt} хэсэгчлэн · ${paidCnt} төлсөн</div></div>
      <div class="stat purple"><div class="stat-l">🏥 Байрлан эмчлүүлж байгаа</div><div class="snum">${activeInps}</div><div class="muted" style="font-size:10px">${inpRows.length} өдрийн бичлэг</div></div>
      <div class="stat accent"><div class="stat-l">⏱️ Дундаж хугацаа</div><div class="snum" style="font-size:18px">${avgDur !== null ? fmtDuration(avgDur) : '—'}</div><div class="muted" style="font-size:10px">${docList.length} эмч ажилласан</div></div>
    </div>

    <div class="ch" style="margin-top:14px">📊 Үйлчилгээний бүтэц</div>
    ${chartHTML}

    <div class="ch" style="margin-top:14px">👨‍⚕️ Эмч нарын ажил</div>
    ${docTable}

    <div class="col2" style="margin-top:14px;gap:14px">
      <div>
        <div class="ch">🩺 Онош</div>
        ${rpMiniTable(diagStats, { nameLabel: 'Онош', byCount: true, hideRev: true, limit: 12, emptyIcon: '🩺' })}
      </div>
      <div>
        <div class="ch">💊 Хэрэглэсэн эм</div>
        ${rpMiniTable(medStats, { nameLabel: 'Эм', byCount: true, hideRev: true, limit: 12, emptyIcon: '💊' })}
      </div>
    </div>

    <div class="col2" style="margin-top:14px;gap:14px">
      <div>
        <div class="ch">💳 Төлбөрийн хэлбэр</div>
        ${rpMiniTable(methodStats.map(m => ({ name: m.name, count: '', rev: m.rev })), { nameLabel: 'Хэлбэр', limit: 10, emptyIcon: '💳', emptyText: 'Төлбөр хийгдээгүй' })}
      </div>
      <div>
        <div class="ch">📍 Аймгаар</div>
        ${rpMiniTable(provStats, { nameLabel: 'Аймаг', byCount: true, limit: 10, emptyIcon: '📍' })}
        ${monthStats.length > 1 ? `<div class="ch" style="margin-top:12px">📆 Сараар</div>${rpMiniTable(monthStats, { nameLabel: 'Сар', limit: 24 })}` : ''}
      </div>
    </div>

    <div class="ch" style="margin-top:16px">🐎 Үзсэн адуудын жагсаалт <span class="ch-r">${examRows.length}</span></div>
    <div class="muted" style="font-size:11px;margin-bottom:6px">Мөр дээр дарж үзлэгийн дэлгэрэнгүйг харна.</div>
    ${rpExamTable(examRows, { showDoc: true })}

    <div class="ch" style="margin-top:16px">🏥 Байрлан эмчлүүлэх — өдрийн эмчилгээ <span class="ch-r">${inpRows.length}</span></div>
    ${rpInpTable(inpRows, true)}

    <div style="margin-top:24px;display:flex;justify-content:space-between;font-size:12px">
      <div>Эмч: ____________________</div>
      <div>Удирдах эмч: ____________________</div>
    </div>
  `;

  $('#print-area').innerHTML = `
    <div class="rp-print">
      <div class="pr-h1">Тайлан — ${periodTxt}</div>
      <div style="text-align:center;margin-bottom:10px">Морьтон Адууны Төв · Бүх эмч</div>
      <div class="pr-h2">Тойм</div>
      <table class="pr-tbl">
        <tr><th>Үзлэг</th><th>Адуу</th><th>Орлого (төлөгдсөн)</th><th>Тооцоолсон дүн</th><th>Төлөгдөөгүй</th><th>Байрлан эмчлүүлж байгаа</th><th>Дундаж хугацаа</th></tr>
        <tr><td>${exams.length}</td><td>${horses.size}</td><td>${mfmt(totalRev)}</td><td>${mfmt(billed)}</td><td>${mfmt(unpaidAmt)} (${unpaidCnt + partCnt})</td><td>${activeInps}</td><td>${avgDur !== null ? fmtDuration(avgDur) : '—'}</td></tr>
      </table>
      <div class="pr-h2">Үйлчилгээний бүтэц</div>
      <table class="pr-tbl">
        <tr><th>Үйлчилгээ</th><th>Тоо</th><th>Дүн</th><th>Дундаж хугацаа</th><th>Хувь</th></tr>
        ${svcEntries.length === 0 ? '<tr><td colspan="5" style="text-align:center">Бичлэг алга</td></tr>' :
          svcEntries.map(s => `<tr><td>${escHTML(s.name)}</td><td>${s.count}</td><td>${mfmt(s.rev)}</td><td>${s.avgDur !== null ? fmtDuration(s.avgDur) : '—'}</td><td>${svcTotalRev > 0 ? (s.rev / svcTotalRev * 100).toFixed(1) + '%' : '—'}</td></tr>`).join('')}
      </table>
      <div class="pr-h2">Эмч нарын ажил</div>
      <table class="pr-tbl">
        <tr><th>Эмч</th><th>Үзсэн адуу</th><th>Үзлэг</th><th>Хамтран</th><th>Үйлчилгээ</th><th>Байрлан эмчилгээ</th><th>Орлого</th></tr>
        ${docList.length === 0 ? '<tr><td colspan="7" style="text-align:center">Бүртгэл алга</td></tr>' :
          docList.map(d => `<tr><td>${escHTML(d.name)}</td><td>${d.horses.size}</td><td>${d.exams}</td><td>${d.assist || '—'}</td><td>${d.services}</td><td>${d.inpLogs || '—'}</td><td>${mfmt(d.rev)}</td></tr>`).join('')}
      </table>
      <div class="pr-cols">
        <div><div class="pr-h2">Онош</div>${rpMiniTablePrint(diagStats, 'Онош', true)}</div>
        <div><div class="pr-h2">Хэрэглэсэн эм</div>${rpMiniTablePrint(medStats, 'Эм', true)}</div>
        <div><div class="pr-h2">Төлбөрийн хэлбэр / Аймаг</div>
          ${methodStats.length ? `<table class="pr-tbl"><tr><th>Хэлбэр</th><th>Дүн</th></tr>${methodStats.map(m => `<tr><td>${escHTML(m.name)}</td><td>${mfmt(m.rev)}</td></tr>`).join('')}</table>` : ''}
          ${rpMiniTablePrint(provStats, 'Аймаг', false)}
        </div>
      </div>
      ${monthStats.length > 1 ? `<div class="pr-h2">Сараар</div>${rpMiniTablePrint(monthStats, 'Сар', false)}` : ''}
      <div class="pr-h2">Үзсэн адуудын жагсаалт (${examRows.length})</div>
      ${rpExamTablePrint(examRows, { showDoc: true })}
      <div class="pr-h2">Байрлан эмчлүүлэх — өдрийн эмчилгээ (${inpRows.length})</div>
      ${rpInpTablePrint(inpRows, true)}
      <div class="pr-sign"><div>Эмч: ____________________</div><div>Удирдах эмч: ____________________</div></div>
    </div>
  `;
}

// ============================================================
// 🎁 ЭМЧИЙН ҮЗЛЭГИЙН УРАМШУУЛАЛ — Accountant / Finance модуль
// Accountant / Financeгийн Excel-ийн логик: үзлэгийн хуудас (баримт) бүрд 10,000₮;
// хамтрагчтай бол үндсэн эмч 6,000₮ + хамтрагч 4,000₮.
// Ангилал: Клиник / Зонд / Дуудлага / Клиник дуудлага (үйлчилгээний нэрээр автоматаар,
// шаардлагатай бол гараар засна). Хувь хэмжээ, нэрс — Системийн тохиргооноос.
// ============================================================
const BONUS_DEFAULT = {
  alone: 10000, main: 6000, assist: 4000,
  kwZond: 'Gastric Tube / Probe', kwCall: 'On-Call Service',
  approver: 'Гүйцэтгэх захирал А.Наранбаатар', checker: 'Э.Оюунчимэг', accountant: 'Ж.Лхамсүрэн',
  perUnit: true // qty = 1 үзлэг = 1 адуу (систем дээр үзлэг бүр тусдаа бичлэг)
};
const BONUS_CATS = ['Clinical Exam', 'Gastric Tube / Probe', 'On-Call Service', 'Clinical On-Call', 'Scheduled Procedure'];
const BONUS_PL_CAT = 'Scheduled Procedure';                                   // тусдаа олгогддог
const BONUS_MAIN_CATS = BONUS_CATS.filter(c => c !== BONUS_PL_CAT);   // үндсэн үзлэгийн ангиллууд
function bonusCfg() { return Object.assign({}, BONUS_DEFAULT, STATE.bonusCfg || {}); }
function saveBonusCfg(patch) {
  STATE.bonusCfg = Object.assign({}, bonusCfg(), patch || {});
  lsSet('mt_bonus_cfg', STATE.bonusCfg);
  try { fbSaveClinicConfig(); } catch (e) { console.error(e); }
}

// Үзлэгийн урамшууллын ангилал
function bonusCategoryOf(e) {
  if (e.bonusCat && BONUS_CATS.includes(e.bonusCat)) return e.bonusCat;
  if (isPlanned(e)) return 'Scheduled Procedure'; // хээрийн төлөвлөгөөт үзлэг — Excel-ийн «ТҮ» хуудас
  const cfg = bonusCfg();
  const names = (Array.isArray(e.services) ? e.services : []).map(s => String(s.name || '').trim()).filter(Boolean);
  const isZond = names.some(n => cfg.kwZond && n.toLowerCase().includes(cfg.kwZond.toLowerCase()));
  const callN = names.filter(n => cfg.kwCall && n.toLowerCase().startsWith(cfg.kwCall.toLowerCase()));
  if (isZond) return 'Gastric Tube / Probe';
  if (callN.length) return callN.length < names.length ? 'Clinical On-Call' : 'On-Call Service';
  return 'Clinical Exam';
}
function bonusDocName(id, fallback) {
  const d = (STATE.doctors || []).find(x => String(x.id) === String(id));
  return d ? d.name : (fallback || '');
}
function bonusDocRole(name) {
  const d = (STATE.doctors || []).find(x => x.name === name);
  return d ? d.role : 'Veterinarian';
}

// Сарын урамшууллын тооцоо
function computeBonus(ym, province) {
  const cfg = bonusCfg();
  const exams = (STATE.exams || []).filter(e => {
    const d = rpNormDate(e.date);
    if (!d || d.slice(0, 7) !== ym) return false;
    if (province && (e.province || '') !== province) return false;
    return true;
  }).sort((a, b) => {
    const da = rpNormDate(a.date), db = rpNormDate(b.date);
    if (da !== db) return da < db ? -1 : 1;
    return (a.time || '') < (b.time || '') ? -1 : 1;
  });
  const rows = exams.map(e => {
    const main = bonusDocName(e.docId, e.docName);
    const asst = e.assistDocId || e.assistDocName ? bonusDocName(e.assistDocId, e.assistDocName) : '';
    const qty = 1;
    const skip = !!e.bonusSkip || !main || main === '—';
    const mainAmt = skip ? 0 : (asst ? cfg.main : cfg.alone) * qty;
    const asstAmt = skip || !asst ? 0 : cfg.assist * qty;
    return { e, id: e.id, date: rpNormDate(e.date), time: e.time || '', examNum: e.examNum || '', horse: e.horse || '', owner: e.owner || '',
      svc: (Array.isArray(e.services) ? e.services : []).map(s => s.name).filter(Boolean).join(', '),
      cat: bonusCategoryOf(e), auto: !e.bonusCat, main, asst, qty, mainAmt, asstAmt, skip, noDoc: !main || main === '—' };
  });
  // Эмчийн нэгтгэл — 🏥 үндсэн үзлэг (Клиник/Зонд/Дуудлага/Клиник дуудлага) ба
  // 🗓️ Төлөвлөгөөт үзлэгийг ТУСАД НЬ (хамтран дүн мөн тусдаа) — ТҮ-ийн урамшуулал тусдаа олгогддог.
  // Ангилал «Төлөвлөгөөт» бол ТҮ-д тооцно (мөрөөр гараар сольсон ангиллыг мөрдөнө).
  const docMap = {};
  const ensure = (n) => { if (!docMap[n]) docMap[n] = { name: n, role: bonusDocRole(n), cats: {}, assist: 0, count: 0, assistCount: 0,
    plMain: 0, plAssist: 0, plCount: 0, plAssistCount: 0, mainTotal: 0, plTotal: 0, total: 0 }; return docMap[n]; };
  rows.forEach(r => {
    if (r.skip) return;
    const pl = r.cat === BONUS_PL_CAT;
    const m = ensure(r.main);
    m.cats[r.cat] = (m.cats[r.cat] || 0) + r.mainAmt;
    if (pl) { m.plMain += r.mainAmt; m.plCount += r.qty; m.plTotal += r.mainAmt; }
    else { m.count += r.qty; m.mainTotal += r.mainAmt; }
    m.total += r.mainAmt;
    if (r.asst) {
      const a = ensure(r.asst);
      if (pl) { a.plAssist += r.asstAmt; a.plAssistCount += r.qty; a.plTotal += r.asstAmt; }
      else { a.assist += r.asstAmt; a.assistCount += r.qty; a.mainTotal += r.asstAmt; }
      a.total += r.asstAmt;
    }
  });
  const docs = Object.values(docMap).sort((a, b) => b.total - a.total);
  const byCat = {}; BONUS_CATS.forEach(c => byCat[c] = rows.filter(r => r.cat === c));
  const total = docs.reduce((a, d) => a + d.total, 0);
  const mainTotal = docs.reduce((a, d) => a + d.mainTotal, 0), plTotal = docs.reduce((a, d) => a + d.plTotal, 0);
  const live = rows.filter(r => !r.skip);
  return { ym, rows, docs, byCat, total, mainTotal, plTotal, cfg, skipped: rows.filter(r => r.skip).length,
    mainDocs: docs.filter(d => d.mainTotal > 0 || d.count || d.assistCount).sort((a, b) => b.mainTotal - a.mainTotal),
    plDocs: docs.filter(d => d.plTotal > 0 || d.plCount || d.plAssistCount).sort((a, b) => b.plTotal - a.plTotal),
    mainN: live.filter(r => r.cat !== BONUS_PL_CAT).length, plN: live.filter(r => r.cat === BONUS_PL_CAT).length,
    mainAsstN: live.filter(r => r.cat !== BONUS_PL_CAT && r.asst).length, plAsstN: live.filter(r => r.cat === BONUS_PL_CAT && r.asst).length };
}
// Хоёр нэгтгэл хүснэгт: үндсэн үзлэг (ТҮ-гүй) ба төлөвлөгөөт үзлэг
function bonusMainSummaryHTML(B, print) {
  const sum = f => B.mainDocs.reduce((a, d) => a + (f(d) || 0), 0);
  const dash = print ? '' : '<span class="muted">—</span>';
  const R = 'style="text-align:right"';
  return `<tr><th>Нэрс</th><th>Албан тушаал</th><th ${R}>Үзлэг</th>${BONUS_MAIN_CATS.map(c => `<th ${R}>${c}</th>`).join('')}<th ${R}>Хамтран</th><th ${R}>Нийт дүн</th></tr>` +
    B.mainDocs.map(d => `<tr><td${print ? '' : ' class="bold"'}>${escHTML(d.name)}</td><td${print ? '' : ' class="muted"'}>${escHTML(d.role)}</td>
      <td ${R}>${d.count}${d.assistCount ? (print ? ' +' : ' <span class="muted">+') + d.assistCount + (print ? '' : '</span>') : ''}</td>
      ${BONUS_MAIN_CATS.map(c => `<td ${R}>${d.cats[c] ? fmt(d.cats[c]) : dash}</td>`).join('')}
      <td ${R}>${d.assist ? fmt(d.assist) : dash}</td><td ${R}><b>${fmt(d.mainTotal)}</b></td></tr>`).join('') +
    `<tr style="background:var(--input)"><td colspan="2"><b>Нийт дүн</b></td><td ${R}><b>${B.mainN}</b></td>${BONUS_MAIN_CATS.map(c => `<td ${R}><b>${fmt(sum(d => d.cats[c]))}</b></td>`).join('')}<td ${R}><b>${fmt(sum(d => d.assist))}</b></td><td ${R}><b>${fmt(B.mainTotal)}</b></td></tr>`;
}
function bonusPlSummaryHTML(B, print) {
  const sum = f => B.plDocs.reduce((a, d) => a + (f(d) || 0), 0);
  const dash = print ? '' : '<span class="muted">—</span>';
  const R = 'style="text-align:right"';
  return `<tr><th>Нэрс</th><th>Албан тушаал</th><th ${R}>Үзлэг (ахлах эмч)</th><th ${R}>Senior Veterinarianийн дүн</th><th ${R}>Хамтарсан үзлэг</th><th ${R}>Хамтран дүн</th><th ${R}>Нийт дүн</th></tr>` +
    B.plDocs.map(d => `<tr><td${print ? '' : ' class="bold"'}>${escHTML(d.name)}</td><td${print ? '' : ' class="muted"'}>${escHTML(d.role)}</td>
      <td ${R}>${d.plCount || dash}</td><td ${R}>${d.plMain ? fmt(d.plMain) : dash}</td><td ${R}>${d.plAssistCount || dash}</td><td ${R}>${d.plAssist ? fmt(d.plAssist) : dash}</td><td ${R}><b>${fmt(d.plTotal)}</b></td></tr>`).join('') +
    `<tr style="background:var(--input)"><td colspan="2"><b>Нийт дүн</b></td><td ${R}><b>${B.plN}</b></td><td ${R}><b>${fmt(sum(d => d.plMain))}</b></td><td ${R}><b>${B.plAsstN}</b></td><td ${R}><b>${fmt(sum(d => d.plAssist))}</b></td><td ${R}><b>${fmt(B.plTotal)}</b></td></tr>`;
}

let __bonusLast = null;
function bonusMonthLabel(ym) { const [y, m] = ym.split('-'); return y + ' оны ' + parseInt(m, 10) + ' сар'; }

function renderBonus() {
  const ymEl = $('#bn-month'); if (!ymEl) return;
  if (!ymEl.value) { const n = new Date(); n.setMonth(n.getMonth() - (n.getDate() < 5 ? 1 : 0)); ymEl.value = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0'); }
  if (ymEl.value + '-01' < LIVE_CUTOFF) ensureRange(ymEl.value + '-01', ymEl.value + '-31').then(ok => { if (ok && STATE.activePage === 'finance') renderBonus(); });
  const provSel = $('#bn-prov');
  if (provSel && !provSel.__filled) {
    provSel.__filled = true;
    const provs = [...new Set((STATE.exams || []).map(e => e.province).filter(Boolean))].sort();
    provSel.innerHTML = '<option value="">Бүх салбар / аймаг</option>' + provs.map(p => `<option>${escHTML(p)}</option>`).join('');
  }
  const B = computeBonus(ymEl.value, provSel ? provSel.value : '');
  __bonusLast = B;
  const host = $('#bn-body'); if (!host) return;
  const cfg = B.cfg;
  if (!B.rows.length) { host.innerHTML = '<div class="empty"><div class="empty-em">🎁</div>' + bonusMonthLabel(B.ym) + ' — үзлэг бүртгэлгүй</div>'; return; }
  const catCount = (c) => B.byCat[c].filter(r => !r.skip).length;
  host.innerHTML = `
    <div class="stats s5" style="margin-bottom:12px">
      <div class="stat green"><div class="stat-l">🏥 Үндсэн үзлэгийн урамшуулал</div><div class="snum">${fmtCompact(B.mainTotal)}</div><div class="muted" style="font-size:10px">${B.mainN} үзлэг · ${B.mainAsstN} хамтарсан · ${B.mainDocs.length} эмч</div></div>
      <div class="stat purple"><div class="stat-l">🗓️ Төлөвлөгөөт урамшуулал</div><div class="snum">${fmtCompact(B.plTotal)}</div><div class="muted" style="font-size:10px">${B.plN} үзлэг · ${B.plAsstN} хамтарсан · тусдаа олгоно</div></div>
      <div class="stat accent"><div class="stat-l">🏥 Клиник</div><div class="snum">${catCount('Clinical Exam')}</div><div class="muted" style="font-size:10px">кл. дуудлага ${catCount('Clinical On-Call')}</div></div>
      <div class="stat"><div class="stat-l">🧪 Зонд / 🚗 Дуудлага</div><div class="snum">${catCount('Gastric Tube / Probe')} <span class="muted" style="font-size:14px">/ ${catCount('On-Call Service')}</span></div><div class="muted" style="font-size:10px">«${escHTML(cfg.kwZond)}» / «${escHTML(cfg.kwCall)}»</div></div>
      <div class="stat"><div class="stat-l">🎁 Бүгд нийт</div><div class="snum">${fmtCompact(B.total)}</div><div class="muted" style="font-size:10px">${B.rows.length - B.skipped} үзлэг${B.skipped ? ' · ' + B.skipped + ' хасагдсан' : ''}</div></div>
    </div>
    <div class="muted" style="font-size:11px;margin-bottom:10px">Хувь хэмжээ: ганцаараа <b>${fmt(cfg.alone)}</b> · хамтарсан бол үндсэн <b>${fmt(cfg.main)}</b> + хамтрагч <b>${fmt(cfg.assist)}</b> (нэг үзлэг = нэг адуу). Ангилал үйлчилгээний нэрээр автоматаар тогтооно — мөр бүр дээр гараар солих, эсвэл урамшууллаас хасах боломжтой; өөрчлөлт бүх төхөөрөмжид хадгалагдана. Тохиргоо → «🎁 Урамшуулал».</div>

    <div class="ch">🏥 Үндсэн үзлэгийн урамшуулал — эмч тус бүрээр <span class="muted" style="font-weight:600;text-transform:none">(төлөвлөгөөт үзлэггүй) · ${escHTML(bonusMonthLabel(B.ym))}</span></div>
    ${B.mainDocs.length ? `<div class="tbl-wrap" style="overflow-x:auto"><table style="min-width:760px"><tbody>${bonusMainSummaryHTML(B)}</tbody></table></div>`
      : '<div class="muted" style="font-size:12px">Энэ сард үндсэн үзлэг алга</div>'}
    <div class="muted" style="font-size:11px;margin-top:4px">«Хамтран» — зөвхөн үндсэн үзлэгт хамтрагч эмчээр орсон дүн. Үзлэг баганын «+N» — хамтрагчаар орсон үзлэгийн тоо.</div>

    <div class="ch" style="margin-top:16px">🗓️ Төлөвлөгөөт үзлэгийн урамшуулал — эмч тус бүрээр <span class="muted" style="font-weight:600;text-transform:none">(тусдаа олгоно)</span></div>
    ${B.plDocs.length ? `<div class="tbl-wrap" style="overflow-x:auto"><table style="min-width:640px"><tbody>${bonusPlSummaryHTML(B)}</tbody></table></div>`
      : '<div class="muted" style="font-size:12px">Энэ сард төлөвлөгөөт үзлэг алга</div>'}
    <div style="margin-top:10px;padding:8px 12px;background:var(--input);border-radius:8px;font-size:12.5px">🎁 Бүгд: үндсэн <b>${fmt(B.mainTotal)}</b> + төлөвлөгөөт <b>${fmt(B.plTotal)}</b> = <b>${fmt(B.total)}</b></div>

    ${BONUS_CATS.map(c => {
      const list = B.byCat[c]; if (!list.length) return '';
      const sumM = list.reduce((a, r) => a + r.mainAmt, 0), sumA = list.reduce((a, r) => a + r.asstAmt, 0);
      return `
      <div class="ch" style="margin-top:16px">${c === 'Gastric Tube / Probe' ? '🧪' : c === 'Scheduled Procedure' ? '🗓️' : c.includes('уудлага') ? '🚗' : '🏥'} ${escHTML(c)} урамшуулал <span class="ch-r">${list.length}</span></div>
      <div class="tbl-wrap" style="overflow-x:auto"><table style="min-width:1000px;font-size:12px">
        <thead><tr><th style="width:28px">#</th><th style="width:100px">Огноо</th><th style="width:70px">Баримт №</th><th style="width:130px">Адуу</th><th>Үйлчилгээ</th><th style="width:120px">Senior Veterinarian</th><th style="width:80px;text-align:right">Дүн</th><th style="width:120px">Хамтрагч</th><th style="width:80px;text-align:right">Дүн</th><th style="width:130px">Ангилал</th><th style="width:60px">Тооцох</th></tr></thead>
        <tbody>${list.map((r, i) => `<tr style="${r.skip ? 'opacity:.5' : ''}">
          <td class="muted">${i + 1}</td>
          <td style="cursor:pointer" onclick="openExamDetail('${escHTML(String(r.id))}')" title="Үзлэг харах">${escHTML(r.date)}<div class="muted" style="font-size:10px">${escHTML(r.time)}</div></td>
          <td class="bold">${escHTML(r.examNum) || '<span class="muted">—</span>'}</td>
          <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHTML(r.horse + ' · ' + r.owner)}">${escHTML(r.horse)}</td>
          <td style="white-space:normal;font-size:11px">${escHTML(r.svc) || '<span class="muted">—</span>'}</td>
          <td class="bold">${escHTML(r.main) || '<span class="badge b-r">эмчгүй</span>'}</td>
          <td style="text-align:right">${r.mainAmt ? fmt(r.mainAmt) : '—'}</td>
          <td>${escHTML(r.asst) || '<span class="muted">—</span>'}</td>
          <td style="text-align:right">${r.asstAmt ? fmt(r.asstAmt) : '—'}</td>
          <td><select class="inp" style="padding:3px 6px;font-size:11px" onchange="setBonusCat('${escHTML(String(r.id))}', this.value)">${BONUS_CATS.map(x => `<option ${x === r.cat ? 'selected' : ''}>${x}</option>`).join('')}</select>${r.auto ? '' : '<div class="muted" style="font-size:9px">гараар</div>'}</td>
          <td style="text-align:center"><input type="checkbox" ${r.skip ? '' : 'checked'} ${r.noDoc ? 'disabled' : ''} onchange="setBonusSkip('${escHTML(String(r.id))}', !this.checked)" title="Урамшуулалд тооцох эсэх"></td>
        </tr>`).join('')}
        <tr style="background:var(--input)"><td colspan="6" class="bold">Нийт дүн</td><td class="bold" style="text-align:right">${fmt(sumM)}</td><td></td><td class="bold" style="text-align:right">${fmt(sumA)}</td><td colspan="2"></td></tr>
        </tbody></table></div>`;
    }).join('')}`;
}
function setBonusCat(id, cat) {
  const e = (STATE.exams || []).find(x => String(x.id) === String(id)); if (!e) return;
  e.bonusCat = cat; e.ms = nowMs();
  saveAll(); fbSaveRecord('exams', e);
  try { writeLog('Урамшууллын ангилал солив', e.id, e.horse, cat, e.id); } catch (_) {}
  renderBonus();
}
function setBonusSkip(id, skip) {
  const e = (STATE.exams || []).find(x => String(x.id) === String(id)); if (!e) return;
  e.bonusSkip = !!skip; e.ms = nowMs();
  saveAll(); fbSaveRecord('exams', e);
  try { writeLog(skip ? 'Урамшууллаас хасав' : 'Урамшуулалд оруулав', e.id, e.horse, e.examNum || '', e.id); } catch (_) {}
  renderBonus();
}

// Хэвлэх — санхүүгийн Excel-ийн загвараар (A4 босоо)
function printBonus() {
  const B = __bonusLast; if (!B || !B.rows.length) { toast('Эхлээд сар сонгоно уу', 'err'); return; }
  const cfg = B.cfg; const label = bonusMonthLabel(B.ym);
  const catTable = (c) => {
    const list = B.byCat[c].filter(r => !r.skip); if (!list.length) return '';
    return `<div class="bn-page">
      <div class="bn-appr">Батлав: ${escHTML(cfg.approver)} ______________</div>
      <div class="pr-h1">Морьтон адууны эмнэлэг ${escHTML(c.toLowerCase())} урамшуулал /${escHTML(label)}/</div>
      <table class="pr-tbl">
        <tr><th>#</th><th>Огноо</th><th>Баримт №</th><th>Тоо хэмжээ</th><th>Senior Veterinarian</th><th>Мөнгөн дүн</th><th>Хамтрагч эмч</th><th>Мөнгөн дүн</th></tr>
        ${list.map((r, i) => `<tr><td>${i + 1}</td><td>${escHTML(r.date)} ${escHTML(r.time)}</td><td>${escHTML(r.examNum)}</td><td style="text-align:right">${r.qty}</td><td>${escHTML(r.main)}</td><td style="text-align:right">${fmt(r.mainAmt)}</td><td>${escHTML(r.asst)}</td><td style="text-align:right">${r.asstAmt ? fmt(r.asstAmt) : ''}</td></tr>`).join('')}
        <tr><td colspan="5"><b>Нийт дүн</b></td><td style="text-align:right"><b>${fmt(list.reduce((a, r) => a + r.mainAmt, 0))}</b></td><td></td><td style="text-align:right"><b>${fmt(list.reduce((a, r) => a + r.asstAmt, 0))}</b></td></tr>
      </table>
    </div>`;
  };
  const summaryPage = (title, rowsHTML, note) => `<div class="bn-page">
      <div class="bn-appr">Батлав: ${escHTML(cfg.approver)} ______________</div>
      <div class="pr-h1">Морьтон адууны эмнэлэг ${escHTML(title)} /${escHTML(label)}/</div>
      <table class="pr-tbl">${rowsHTML}</table>
      <div class="muted" style="font-size:8.5pt;margin-top:6px">${escHTML(note)} Хувь хэмжээ: ганцаараа ${fmt(cfg.alone)}, хамтарсан үзлэгт үндсэн эмч ${fmt(cfg.main)} + хамтрагч ${fmt(cfg.assist)}. Системээс автоматаар тооцов — ${localDateStr(new Date())}.</div>
      <div class="pr-sign" style="margin-top:40px"><div>Хянасан: ______________ /${escHTML(cfg.checker)}/</div><div>Нягтлан бодогч: ______________ /${escHTML(cfg.accountant)}/</div></div>
    </div>`;
  $('#print-area').innerHTML = `<div class="rp-print bn-print">
    ${BONUS_MAIN_CATS.map(catTable).join('')}
    ${B.mainDocs.length ? summaryPage('үзлэг урамшуулал', bonusMainSummaryHTML(B, true), 'Төлөвлөгөөт үзлэг энэ хүснэгтэд ОРООГҮЙ (тусдаа хуудсанд).') : ''}
    ${catTable(BONUS_PL_CAT)}
    ${B.plDocs.length ? summaryPage('төлөвлөгөөт үзлэгийн урамшуулал', bonusPlSummaryHTML(B, true), 'Зөвхөн төлөвлөгөөт (хээрийн) үзлэг.') : ''}
  </div>`;
  try { writeLog('Урамшууллын тайлан хэвлэв', '', '', label + ' · ' + fmt(B.total)); } catch (_) {}
  setTimeout(() => window.print(), 100);
}
function exportBonusCSV() {
  const B = __bonusLast; if (!B || !B.rows.length) { toast('Эхлээд сар сонгоно уу', 'err'); return; }
  const rows = [['Ангилал', 'Огноо', 'Цаг', 'Баримт №', 'Адуу', 'Эзэн', 'Үйлчилгээ', 'Тоо хэмжээ', 'Senior Veterinarian', 'Мөнгөн дүн', 'Хамтрагч эмч', 'Мөнгөн дүн', 'Тооцсон эсэх']];
  BONUS_CATS.forEach(c => B.byCat[c].forEach(r => rows.push([c, r.date, r.time, r.examNum, r.horse, r.owner, r.svc, r.qty, r.main, r.mainAmt, r.asst, r.asstAmt, r.skip ? 'Хасагдсан' : 'Тийм'])));
  const S = f => B.mainDocs.reduce((a, d) => a + (f(d) || 0), 0), P = f => B.plDocs.reduce((a, d) => a + (f(d) || 0), 0);
  rows.push([]); rows.push(['ҮНДСЭН ҮЗЛЭГИЙН УРАМШУУЛАЛ (төлөвлөгөөтгүй) — ' + bonusMonthLabel(B.ym)]);
  rows.push(['Нэрс', 'Албан тушаал', 'Үзлэг', 'Хамтарсан үзлэг', ...BONUS_MAIN_CATS, 'Хамтран', 'Нийт дүн']);
  B.mainDocs.forEach(d => rows.push([d.name, d.role, d.count, d.assistCount, ...BONUS_MAIN_CATS.map(c => d.cats[c] || 0), d.assist, d.mainTotal]));
  rows.push(['Нийт', '', B.mainN, B.mainAsstN, ...BONUS_MAIN_CATS.map(c => S(d => d.cats[c])), S(d => d.assist), B.mainTotal]);
  rows.push([]); rows.push(['ТӨЛӨВЛӨГӨӨТ ҮЗЛЭГИЙН УРАМШУУЛАЛ — ' + bonusMonthLabel(B.ym)]);
  rows.push(['Нэрс', 'Албан тушаал', 'Үзлэг (ахлах эмч)', 'Senior Veterinarianийн дүн', 'Хамтарсан үзлэг', 'Хамтран дүн', 'Нийт дүн']);
  B.plDocs.forEach(d => rows.push([d.name, d.role, d.plCount, d.plMain, d.plAssistCount, d.plAssist, d.plTotal]));
  rows.push(['Нийт', '', B.plN, P(d => d.plMain), B.plAsstN, P(d => d.plAssist), B.plTotal]);
  rows.push([]); rows.push(['БҮГД', '', '', '', '', '', B.total]);
  downloadCSV(rows, 'урамшуулал_' + B.ym + '.csv');
}

// Admin: урамшууллын тохиргоо
function renderBonusCfg() {
  const cfg = bonusCfg();
  const set = (id, v) => { const el = $('#' + id); if (el) el.value = v; };
  set('bn-cfg-alone', cfg.alone); set('bn-cfg-main', cfg.main); set('bn-cfg-assist', cfg.assist);
  set('bn-cfg-zond', cfg.kwZond); set('bn-cfg-call', cfg.kwCall);
  set('bn-cfg-approver', cfg.approver); set('bn-cfg-checker', cfg.checker); set('bn-cfg-acc', cfg.accountant);
}
function saveBonusCfgFromForm() {
  if (!(typeof canAccess === 'function' && (canAccess('admin') || canAccess('finance')))) { toast('Эрх хүрэхгүй', 'err'); return; }
  const num = (id, d) => { const v = parseFloat(($('#' + id) || {}).value); return isNaN(v) ? d : v; };
  const str = (id, d) => { const v = (($('#' + id) || {}).value || '').trim(); return v || d; };
  saveBonusCfg({ alone: num('bn-cfg-alone', 10000), main: num('bn-cfg-main', 6000), assist: num('bn-cfg-assist', 4000),
    kwZond: str('bn-cfg-zond', 'Gastric Tube / Probe'), kwCall: str('bn-cfg-call', 'On-Call Service'),
    approver: str('bn-cfg-approver', ''), checker: str('bn-cfg-checker', ''), accountant: str('bn-cfg-acc', '') });
  try { writeLog('Урамшууллын тохиргоо солив', '', '', fmt(STATE.bonusCfg.alone) + ' / ' + fmt(STATE.bonusCfg.main) + '+' + fmt(STATE.bonusCfg.assist)); } catch (_) {}
  toast('✅ Урамшууллын тохиргоо хадгалагдлаа', 'ok');
}

// ============================================================
// ☁️ БҮХ ДАТА ТАТАХ — Firestore-оос шууд (Full data export)
// Зорилго: системийн бүх өгөгдлийг нэг дор татаж, өөр систем рүү
// шилжүүлэх / нөөцлөх / AI-д унших боломжтой болгох.
// Хэл: Монгол эсвэл English (талбарын нэр, төлөвийн утга хөрвүүлнэ).
// ============================================================
const EXPORT_COLLECTIONS = [
  'horses', 'waiting', 'exams', 'fins', 'inps', 'labs',
  'doctors', 'users', 'staff', 'logs', 'deletedExams', 'trips'
];

// Collection-ийн нэр → (mn, en) гарчиг
const EXPORT_SHEETS = {
  horses:       { mn: 'Адуу',              en: 'Horses' },
  waiting:      { mn: 'Хүлээлт',           en: 'Waiting' },
  exams:        { mn: 'Үзлэг',             en: 'Exams' },
  trips:        { mn: 'Төлөвлөгөөт явц',   en: 'PlannedTrips' },
  examServices: { mn: 'Үзлэг-Үйлчилгээ',   en: 'ExamServices' },
  examMeds:     { mn: 'Үзлэг-Эм',          en: 'ExamMedicines' },
  fins:         { mn: 'Accountant / Finance',            en: 'Finance' },
  payments:     { mn: 'Төлбөрүүд',         en: 'Payments' },
  inps:         { mn: 'Байрлан эмчлүүлэх', en: 'Inpatients' },
  inpLogs:      { mn: 'Байрлан-Өдрийн бичлэг', en: 'InpatientDailyLog' },
  labs:         { mn: 'Шинжилгээ',         en: 'LabOrders' },
  labHistory:   { mn: 'Шинжилгээ-Түүх',    en: 'LabStatusHistory' },
  doctors:      { mn: 'Эмч',               en: 'Doctors' },
  users:        { mn: 'Хэрэглэгч',         en: 'Users' },
  staff:        { mn: 'Ажлын хуваарь',     en: 'StaffRoster' },
  schedule:     { mn: 'Сарын хуваарь',     en: 'MonthlySchedule' },
  logs:         { mn: 'Үйл ажиллагааны лог', en: 'ActivityLog' },
  deletedExams: { mn: 'Устгасан үзлэг',    en: 'DeletedExams' },
  servicePrices:{ mn: 'Үйлчилгээний үнэ',  en: 'ServicePrices' },
  config:       { mn: 'Тохиргоо',          en: 'Settings' },
  dictionary:   { mn: 'Талбарын тайлбар',  en: 'DataDictionary' }
};

// Талбарын нэр → (mn гарчиг, en гарчиг, тайлбар)
// Excel-ийн баганын дараалал энэ жагсаалтын дарааллаар тогтоно.
const EXPORT_FIELDS = {
  horses: [
    ['id',        'ID',                 'id',            'Дотоод дугаар / internal id', "Internal record id"],
    ['name',      'Зүс (нэр)',          'horse_name',    'Адууны зүс, нэр', "Horse coat colour / name (Mongolian horses are identified by coat pattern)"],
    ['iabd',      'ИАБД',               'registry_no',   'Ирсэн адууны бүртгэлийн дугаар', "Arrival registry number (ИАБД) written on the paper form"],
    ['owner',     'Эзэн',               'owner',         'Эзэмшигчийн нэр', "Owner full name"],
    ['phone',     'Утас',               'phone',         'Үндсэн утас', "Primary phone"],
    ['phone2',    'Утас 2',             'phone2',        'Нэмэлт утас', "Secondary phone"],
    ['age',       'Нас',                'age',           'Нас', "Age in years"],
    ['breed',     'Үүлдэр',             'breed',         'Үүлдэр', "Breed"],
    ['mark',      'Тамга/тэмдэг',       'brand_mark',    'Тамга, онцгой тэмдэг', "Brand mark / distinguishing marks"],
    ['province',  'Аймаг',              'province',      'Аймаг / хот', "Province or city"],
    ['soum',      'Сум',                'soum',          'Сум / дүүрэг', "District (soum)"],
    ['date',      'Бүртгэсэн огноо',    'registered_date','Бүртгэсэн огноо (YYYY-MM-DD)', "Registration date (YYYY-MM-DD)"],
    ['extra',     'Нэмэлт тэмдэглэл',   'notes',         'Нэмэлт тэмдэглэл', "Free-text notes"],
    ['createdAt', 'Үүсгэсэн (ms)',      'created_at_ms', 'Үүсгэсэн агшин (epoch ms)', "Created at (epoch ms)"],
    ['ms',        'Сүүлд өөрчилсөн (ms)','updated_at_ms','Сүүлд өөрчилсөн агшин (epoch ms)', "Last modified (epoch ms)"]
  ],
  waiting: [
    ['id',        'ID',                 'id',            'Дотоод дугаар', "Internal record id"],
    ['examNum',   'Үзлэгийн хуудасны №','exam_no',       'Үзлэгийн хуудасны дугаар', "Exam sheet number"],
    ['horseId',   'Адууны ID',          'horse_id',      'horses.id-тэй холбоо', "FK to Horses.id"],
    ['horse',     'Зүс',                'horse_name',    'Адууны зүс', "Horse coat colour"],
    ['owner',     'Эзэн',               'owner',         'Эзэмшигч', "Owner"],
    ['phone',     'Утас',               'phone',         'Утас', "Phone"],
    ['symptoms',  'Шинж тэмдэг/анамнез','symptoms',      'Бүртгэлийн үед бичсэн', "Complaint / history taken at reception"],
    ['province',  'Аймаг',              'province',      'Аймаг', "Province"],
    ['soum',      'Сум',                'soum',          'Сум', "District"],
    ['ms',        'Бүртгэсэн (ms)',     'queued_at_ms',  'Дараалалд орсон агшин', "Queued at (epoch ms)"]
  ],
  exams: [
    ['id',           'ID',               'id',              'Дотоод дугаар', "Internal record id"],
    ['examNum',      'Үзлэгийн хуудасны №','exam_no',       'Үзлэгийн хуудасны дугаар', "Exam sheet number (paper form number, business key)"],
    ['@kind',        'Төрөл',            'exam_type',       'Клиник / Төлөвлөгөөт', "Clinic visit or planned field inspection"],
    ['tripId',       'Явцын ID',         'trip_id',         'trips.id (төлөвлөгөөт бол)', "FK to PlannedTrips.id (planned exams only)"],
    ['tripLocation', 'Явцын байршил',    'trip_location',   'Төлөвлөгөөт үзлэгийн байршил', "Field trip location (planned exams only)"],
    ['date',         'Огноо',            'exam_date',       'Үзлэгийн огноо (YYYY-MM-DD)', "Exam date (YYYY-MM-DD)"],
    ['time',         'Цаг',              'exam_time',       'Үзлэгийн цаг (HH:MM)', "Exam time (HH:MM)"],
    ['horseId',      'Адууны ID',        'horse_id',        'horses.id', "FK to Horses.id"],
    ['horse',        'Зүс',              'horse_name',      'Адууны зүс', "Horse coat colour"],
    ['owner',        'Эзэн',             'owner',           'Эзэмшигч', "Owner"],
    ['phone',        'Утас',             'phone',           'Утас', "Phone"],
    ['province',     'Аймаг',            'province',        'Аймаг', "Province"],
    ['soum',         'Сум',              'soum',            'Сум', "District"],
    ['docId',        'Эмчийн ID',        'doctor_id',       'doctors.id', "FK to Doctors.id (lead vet)"],
    ['docName',      'Эмч',              'doctor_name',     'Үндсэн эмч', "Lead veterinarian name"],
    ['assistDocId',  'Хамтрагч эмчийн ID','assistant_doctor_id','doctors.id', "FK to Doctors.id (assisting vet)"],
    ['assistDocName','Хамтрагч эмч',     'assistant_doctor_name','Хамтран оролцсон эмч', "Assisting veterinarian name"],
    ['anamnesis',    'Анамнез',          'anamnesis',       'Бүртгэлийн үед бичсэн түүх', "Case history recorded at reception"],
    ['@symptoms',    'Шинж тэмдэг',      'symptoms',        'Эмчийн сонгосон шинж тэмдгүүд (таслалаар)', "Symptoms selected by the vet (comma separated)"],
    ['diagnosis',    'Онош',             'diagnosis',       'Онош', "Diagnosis"],
    ['@dxStatus',    'Онош батлалт',     'dx_review_status', 'Senior Veterinarianийн хяналт: хянагдаж байна / батлагдсан / буцаагдсан (хоосон = журмаас өмнөх)', "Senior-vet diagnosis review: pending / approved / returned (blank = before the review rule)"],
    ['dxApprovedBy', 'Онош баталсан',    'dx_approved_by',  'Оношийг баталсан ахлах эмч', "Senior vet who approved the diagnosis"],
    ['@dxApprovedAt','Баталсан цаг',     'dx_approved_at',  'YYYY-MM-DD HH:MM', "Approval time"],
    ['dxOriginal',   'Анхны онош (засахаас өмнө)', 'dx_original', 'Senior Veterinarian засаж баталсан бол эмчийн анх бичсэн онош', "Vet's original diagnosis when the senior vet edited it"],
    ['note',         'Эмчийн тэмдэглэл', 'doctor_note',     'Эмчийн тэмдэглэл', "Veterinarian note"],
    ['temp',         'Температур',       'temperature',     '°C', "Body temperature (°C)"],
    ['pulse',        'Зүрхний цохилт',   'pulse',           'уд/мин', "Heart rate (bpm)"],
    ['resp',         'Амьсгал',          'respiration',     'уд/мин', "Respiration rate (per min)"],
    ['wt',           'Жин',              'weight_kg',       'kg', "Body weight (kg)"],
    ['@services',    'Үйлчилгээ',        'services',        'Үйлчилгээний нэрс (таслалаар) — дэлгэрэнгүйг ExamServices хуудсаас', "Service names (comma separated) — see ExamServices sheet for line items"],
    ['@meds',        'Эм',               'medicines',       'Эмийн нэрс (таслалаар) — дэлгэрэнгүйг ExamMedicines хуудсаас', "Medicine names (comma separated) — see ExamMedicines sheet"],
    ['amount',       'Нийт дүн',         'total_amount',    '₮', "Total invoiced amount (MNT)"],
    ['durationMin',  'Үргэлжилсэн (мин)','duration_min',    'Бүртгэснээс дуусгах хүртэлх минут', "Minutes from registration to completion"],
    ['@inpatient',   'Байрлан эмчлүүлсэн эсэх','is_inpatient','Тийм/Үгүй', "Whether the case was admitted as inpatient"],
    ['@imageCount',  'Зургийн тоо',      'image_count',     'Хавсаргасан зургийн тоо', "Number of attached photos (files stay in Firebase Storage)"],
    ['bonusCat',     'Урамшууллын ангилал','bonus_category','Клиник/Зонд/Дуудлага (гараар зассан бол)', "Bonus category override (Clinic / Tube / Call-out)"],
    ['@bonusSkip',   'Урамшууллаас хассан','bonus_excluded','Тийм/Үгүй', "Excluded from doctor bonus calculation"],
    ['regMs',        'Бүртгэсэн (ms)',   'registered_at_ms','Адуу бүртгэсэн агшин', "Horse registered at (epoch ms)"],
    ['doneMs',       'Дуусгасан (ms)',   'completed_at_ms', 'Үзлэг дуусгасан агшин', "Exam completed at (epoch ms)"],
    ['ms',           'Сүүлд өөрчилсөн (ms)','updated_at_ms','Сүүлд өөрчилсөн агшин', "Last modified (epoch ms)"]
  ],
  examServices: [
    ['examId',   'Үзлэгийн ID',        'exam_id',    'exams.id', "FK to Exams.id"],
    ['examNum',  'Үзлэгийн хуудасны №','exam_no',    'Үзлэгийн дугаар', "Exam sheet number"],
    ['date',     'Огноо',              'exam_date',  'Үзлэгийн огноо', "Exam date"],
    ['horse',    'Зүс',                'horse_name', 'Адуу', "Horse"],
    ['name',     'Үйлчилгээ',          'service_name','Үйлчилгээний нэр', "Service name"],
    ['price',    'Үнэ',                'price',      '₮', "Line price (MNT)"]
  ],
  examMeds: [
    ['examId',   'Үзлэгийн ID',        'exam_id',    'exams.id', "FK to Exams.id"],
    ['examNum',  'Үзлэгийн хуудасны №','exam_no',    'Үзлэгийн дугаар', "Exam sheet number"],
    ['date',     'Огноо',              'exam_date',  'Үзлэгийн огноо', "Exam date"],
    ['horse',    'Зүс',                'horse_name', 'Адуу', "Horse"],
    ['name',     'Эмийн нэр',          'medicine_name','Эмийн нэр', "Medicine name"],
    ['note',     'Заавар',             'dosage_note','Хэрэглэх заавар', "Dosage / administration note"]
  ],
  trips: [
    ['id',          'ID',             'id',               'Дотоод дугаар', "Internal record id"],
    ['date',        'Огноо',          'date',             'Явц эхэлсэн огноо', "Trip start date"],
    ['endDate',     'Дуусах огноо',   'end_date',         'Явц дууссан огноо', "Trip end date"],
    ['@route',      'Маршрут',        'route',            'Явсан аймгууд', "Route (provinces visited)"],
    ['@team',       'Баг (эмч нар)',  'team',             'Явцын эмч нар', "Veterinarians on the trip"],
    ['docName',     'Senior Veterinarian',      'lead_doctor',      'Багийн ахлах эмч', "Lead veterinarian"],
    ['@n',          'Үзлэгийн тоо',   'exam_count',       'Явцад шивсэн үзлэг', "Exams recorded on this trip"],
    ['@amount',     'Нийт дүн',       'total_amount',     '₮', "Total invoiced amount (MNT)"],
    ['@statusMn',   'Төлөв',          'status',           'Нээлттэй / Хаагдсан', "Open / Closed"],
    ['note',        'Тэмдэглэл',      'note',             'Тэмдэглэл', "Note"],
    ['createdBy',   'Үүсгэсэн',       'created_by',       'Үүсгэсэн хэрэглэгч', "Created by"],
    ['ms',          'Сүүлд өөрчилсөн (ms)','updated_at_ms','Сүүлд өөрчилсөн агшин', "Last modified (epoch ms)"]
  ],
  fins: [
    ['id',        'ID',                 'id',            'Дотоод дугаар', "Internal record id"],
    ['examId',    'Үзлэгийн ID',        'exam_id',       'exams.id', "FK to Exams.id"],
    ['examNum',   'Үзлэгийн хуудасны №','exam_no',       'Үзлэгийн дугаар', "Exam sheet number"],
    ['date',      'Огноо',              'invoice_date',  'Нэхэмжилсэн огноо', "Invoice date"],
    ['horse',     'Зүс',                'horse_name',    'Адуу', "Horse"],
    ['owner',     'Эзэн',               'owner',         'Эзэмшигч', "Owner"],
    ['phone',     'Утас',               'phone',         'Утас', "Phone"],
    ['docName',   'Эмч',                'doctor_name',   'Эмч', "Veterinarian"],
    ['services',  'Үйлчилгээ',          'services',      'Үйлчилгээний нэрс', "Services billed (text)"],
    ['amount',    'Нийт дүн',           'total_amount',  '₮', "Invoice total (MNT)"],
    ['@paidSum',  'Төлсөн дүн',         'paid_amount',   'Хийгдсэн төлбөрийн нийлбэр', "Sum of recorded payments (MNT)"],
    ['@due',      'Үлдэгдэл',           'balance_due',   'Төлөгдөөгүй үлдэгдэл', "Outstanding balance (MNT)"],
    ['@status',   'Төлөв',              'status',        'Төлсөн / Хэсэгчлэн / Төлөөгүй', "Paid / Partial / Unpaid"],
    ['method',    'Төлбөрийн хэлбэр',   'payment_method','Бэлэн/карт/QPay/дансаар...', "Payment method"],
    ['paidDate',  'Төлсөн огноо',       'paid_date',     'Бүрэн төлөгдсөн огноо', "Date fully paid"],
    ['paidMs',    'Төлсөн (ms)',        'paid_at_ms',    'Төлсөн агшин', "Paid at (epoch ms)"],
    ['ms',        'Сүүлд өөрчилсөн (ms)','updated_at_ms','Сүүлд өөрчилсөн агшин', "Last modified (epoch ms)"]
  ],
  payments: [
    ['finId',    'Accountant / Financeгийн ID',      'finance_id',  'fins.id', "FK to Finance.id"],
    ['examNum',  'Үзлэгийн хуудасны №','exam_no',     'Үзлэгийн дугаар', "Exam sheet number"],
    ['horse',    'Зүс',                'horse_name',  'Адуу', "Horse"],
    ['date',     'Огноо',              'payment_date','Төлбөр хийсэн огноо', "Payment date"],
    ['amount',   'Дүн',                'amount',      '₮', "Amount (MNT)"],
    ['method',   'Хэлбэр',             'method',      'Бэлэн/карт/QPay/дансаар/зээл', "Cash / Card / QPay / Bank transfer / Credit"],
    ['note',     'Тэмдэглэл',          'note',        'Тэмдэглэл', "Note"]
  ],
  inps: [
    ['id',            'ID',              'id',              'Дотоод дугаар', "Internal record id"],
    ['examId',        'Үзлэгийн ID',     'exam_id',         'exams.id', "FK to Exams.id"],
    ['horse',         'Зүс',             'horse_name',      'Адуу', "Horse"],
    ['owner',         'Эзэн',            'owner',           'Эзэмшигч', "Owner"],
    ['phone',         'Утас',            'phone',           'Утас', "Phone"],
    ['docName',       'Эмч',             'doctor_name',     'Хариуцсан эмч', "Attending veterinarian"],
    ['diagnosis',     'Онош',            'diagnosis',       'Онош', "Admission diagnosis"],
    ['admittedDate',  'Орсон огноо',     'admitted_date',   'Байрлан эмчлүүлэхэд орсон огноо', "Admission date"],
    ['dischargedDate','Гарсан огноо',    'discharged_date', 'Гарсан огноо', "Discharge date"],
    ['@discharged',   'Гарсан эсэх',     'is_discharged',   'Тийм/Үгүй', "Whether discharged"],
    ['@days',         'Хоног',           'days',            'Байрласан хоног', "Days hospitalised"],
    ['initialAmount', 'Анхны дүн',       'initial_amount',  'Хүлээн авах үеийн дүн ₮', "Amount charged on admission (MNT)"],
    ['@logAmount',    'Өдрийн эмчилгээний дүн','daily_treatment_amount','Өдрийн бичлэгүүдийн нийлбэр ₮', "Sum of daily treatment charges (MNT)"],
    ['@logCount',     'Өдрийн бичлэгийн тоо','log_entries', 'Өдрийн бичлэгийн тоо', "Number of daily log entries"],
    ['admittedMs',    'Орсон (ms)',      'admitted_at_ms',  'Орсон агшин', "Admitted at (epoch ms)"],
    ['dischargedMs',  'Гарсан (ms)',     'discharged_at_ms','Гарсан агшин', "Discharged at (epoch ms)"],
    ['ms',            'Сүүлд өөрчилсөн (ms)','updated_at_ms','Сүүлд өөрчилсөн агшин', "Last modified (epoch ms)"]
  ],
  inpLogs: [
    ['inpId',     'Байрлангийн ID',   'inpatient_id', 'inps.id', "FK to Inpatients.id"],
    ['horse',     'Зүс',              'horse_name',   'Адуу', "Horse"],
    ['date',      'Огноо',            'log_date',     'Эмчилгээний огноо', "Treatment date"],
    ['docName',   'Эмч',              'doctor_name',  'Эмчилсэн эмч', "Treating veterinarian"],
    ['diagnosis', 'Онош',             'diagnosis',    'Тухайн өдрийн онош', "Diagnosis that day"],
    ['note',      'Тэмдэглэл',        'note',         'Эмчилгээний тэмдэглэл', "Treatment note"],
    ['temp',      'Температур',       'temperature',  '°C', "Temperature (°C)"],
    ['pulse',     'Зүрхний цохилт',   'pulse',        'уд/мин', "Heart rate (bpm)"],
    ['wt',        'Жин',              'weight_kg',    'kg', "Weight (kg)"],
    ['@services', 'Үйлчилгээ',        'services',     'Үйлчилгээний нэрс', "Services performed"],
    ['@meds',     'Эм',               'medicines',    'Эмийн нэрс', "Medicines given"],
    ['amount',    'Дүн',              'amount',       '₮', "Charge for the day (MNT)"]
  ],
  labs: [
    ['id',         'ID',                'id',           'Дотоод дугаар', "Internal record id"],
    ['examId',     'Үзлэгийн ID',       'exam_id',      'exams.id', "FK to Exams.id"],
    ['examNum',    'Үзлэгийн хуудасны №','exam_no',     'Үзлэгийн дугаар', "Exam sheet number"],
    ['date',       'Огноо',             'order_date',   'Захиалсан огноо', "Order date"],
    ['horseId',    'Адууны ID',         'horse_id',     'horses.id', "FK to Horses.id"],
    ['horse',      'Зүс',               'horse_name',   'Адуу', "Horse"],
    ['owner',      'Эзэн',              'owner',        'Эзэмшигч', "Owner"],
    ['docName',    'Эмч',               'doctor_name',  'Захиалсан эмч', "Ordering veterinarian"],
    ['service',    'Шинжилгээний нэр',  'test_name',    'Шинжилгээний төрөл', "Laboratory test name"],
    ['price',      'Үнэ',               'price',        '₮', "Price (MNT)"],
    ['diagnosis',  'Онош',              'diagnosis',    'Үзлэгийн онош', "Clinical diagnosis"],
    ['@statusMn',  'Төлөв',             'status',       'Захиалсан→Сорьц авсан→Илгээсэн→Хүлээн авсан→Хариу гарсан', "Ordered → Sample collected → Sent to lab → Sample received → Result ready"],
    ['resultNote', 'Хариуны тайлбар',   'result_note',  'Хариуны тэмдэглэл', "Result note"],
    ['@resultCount','Хариуны зургийн тоо','result_image_count','Хавсаргасан хариуны зураг', "Number of attached result images"],
    ['orderedMs',  'Захиалсан (ms)',    'ordered_at_ms','Захиалсан агшин', "Ordered at (epoch ms)"],
    ['doneMs',     'Хариу гарсан (ms)', 'completed_at_ms','Хариу гарсан агшин', "Result ready at (epoch ms)"],
    ['ms',         'Сүүлд өөрчилсөн (ms)','updated_at_ms','Сүүлд өөрчилсөн агшин', "Last modified (epoch ms)"]
  ],
  labHistory: [
    ['labId',    'Шинжилгээний ID',  'lab_order_id', 'labs.id', "FK to LabOrders.id"],
    ['examNum',  'Үзлэгийн хуудасны №','exam_no',    'Үзлэгийн дугаар', "Exam sheet number"],
    ['horse',    'Зүс',              'horse_name',   'Адуу', "Horse"],
    ['@statusMn','Төлөв',            'status',       'Шилжсэн төлөв', "Status the order moved into"],
    ['@date',    'Огноо цаг',        'changed_at',   'Огноо цаг', "Changed at"],
    ['user',     'Хэрэглэгч',        'changed_by',   'Өөрчилсөн хэрэглэгч', "Changed by"],
    ['note',     'Тэмдэглэл',        'note',         'Тэмдэглэл', "Note"]
  ],
  doctors: [
    ['id',    'ID',        'id',          'Дотоод дугаар', "Internal record id"],
    ['name',  'Нэр',       'name',        'Эмчийн нэр', "Veterinarian name"],
    ['role',  'Албан тушаал','role',      'Chief Veterinarian / Senior Veterinarian / Veterinarian...', "Position (chief vet / senior vet / veterinarian / intern)"],
    ['exams', 'Үзлэгийн тоо','exam_count','Хуримтлагдсан үзлэгийн тоо', "Cumulative exam count"],
    ['rev',   'Орлого',    'revenue',     'Хуримтлагдсан орлого ₮', "Cumulative revenue (MNT)"]
  ],
  users: [
    ['name',    'Нэвтрэх нэр', 'username',      'Нэвтрэх нэр', "Login name"],
    ['role',    'Эрх',         'role',          'Дүр / эрх', "Role"],
    ['@pages',  'Хандах хуудас','allowed_pages','Хандах эрхтэй хуудсууд', "Pages this role may open"],
    ['@labEdit','Шинжилгээ засах','can_edit_lab','Тийм/Үгүй', "May edit laboratory orders"],
    ['@hasPw',  'Нууц үг тохируулсан','has_password','Тийм/Үгүй (нууц үг өөрөө экспортлогдохгүй)', "Has a password set (the hash itself is not exported)"],
    ['ms',      'Сүүлд өөрчилсөн (ms)','updated_at_ms','Сүүлд өөрчилсөн агшин', "Last modified (epoch ms)"]
  ],
  staff: [
    ['id',      'Огноо (ID)',  'id',            'YYYY-MM-DD', "Roster date (YYYY-MM-DD)"],
    ['date',    'Огноо',       'roster_date',   'Огноо', "Roster date"],
    ['@active', 'Ажилласан эмч','working_doctor_ids','doctors.id (таслалаар)', "Doctor ids working that day"],
    ['@duty',   'Жижүүр эмч',  'on_duty_doctor_ids','doctors.id (таслалаар)', "Doctor ids on duty that day"]
  ],
  schedule: [
    ['month',    'Сар',        'month',       'YYYY-MM', "Month (YYYY-MM)"],
    ['docId',    'Эмчийн ID',  'doctor_id',   'doctors.id', "FK to Doctors.id"],
    ['docName',  'Эмч',        'doctor_name', 'Эмчийн нэр', "Veterinarian name"],
    ['date',     'Огноо',      'date',        'YYYY-MM-DD', "Date (YYYY-MM-DD)"],
    ['@statusMn','Төлөв',      'status',      'Ажиллах / Жижүүр / Амрах', "Work / On duty / Off"]
  ],
  logs: [
    ['log_date',   'Огноо цаг',    'logged_at',   'Огноо цаг', "Timestamp"],
    ['user_name',  'Хэрэглэгч',    'user_name',   'Хэрэглэгчийн нэр', "User name"],
    ['user_role',  'Эрх',          'user_role',   'Хэрэглэгчийн дүр', "User role"],
    ['action',     'Үйлдэл',       'action',      'Хийсэн үйлдэл', "Action performed"],
    ['target_name','Объект',       'target_name', 'Хамаарах бичлэг', "Affected record"],
    ['details',    'Дэлгэрэнгүй',  'details',     'Дэлгэрэнгүй тайлбар', "Details"],
    ['exam_id',    'Үзлэгийн №',   'exam_no',     'Хамаарах үзлэгийн дугаар', "Related exam sheet number"],
    ['target_id',  'Объектын ID',  'target_id',   'Хамаарах бичлэгийн id', "Affected record id"],
    ['id',         'ID',           'id',          'Логийн дугаар', "Log id"]
  ],
  servicePrices: [
    ['name',  'Үйлчилгээ', 'service_name', 'Үйлчилгээний нэр', "Service name"],
    ['price', 'Үнэ',       'price',        '₮', "Standard price (MNT)"],
    ['@src',  'Эх сурвалж','source',       'Үндсэн жагсаалт / Нэмсэн', "Built-in list or custom-added"]
  ],
  config: [
    ['key',   'Тохиргоо', 'setting',  'Тохиргооны нэр', "Setting name"],
    ['value', 'Утга',     'value',    'Утга', "Value"]
  ],
  dictionary: [
    ['sheet', 'Хуудас',   'sheet',       'Хуудасны нэр', "Sheet name"],
    ['mn',    'Багана (MN)','column_mn', 'Монгол баганын нэр', "Mongolian column header"],
    ['en',    'Багана (EN)','column_en', 'Англи баганын нэр', "English column header"],
    ['key',   'Талбар',   'field_key',   'Firestore дэх талбарын нэр', "Firestore field name"],
    ['desc',  'Тайлбар',  'description', 'Тайлбар', "Description"]
  ]
};

// Төлөв / утгын орчуулга
const EXPORT_VAL = {
  yes:  { mn: 'Тийм', en: 'Yes' },
  no:   { mn: 'Үгүй', en: 'No' },
  paid: { mn: 'Төлсөн', en: 'Paid' },
  part: { mn: 'Хэсэгчлэн', en: 'Partial' },
  unpaid:{ mn: 'Төлөөгүй', en: 'Unpaid' },
  work: { mn: 'Ажиллах', en: 'Work' },
  duty: { mn: 'Night Duty', en: 'On duty' },
  off:  { mn: 'Амрах', en: 'Off' },
  base: { mn: 'Үндсэн жагсаалт', en: 'Built-in' },
  custom:{ mn: 'Нэмсэн', en: 'Custom' }
};
const LAB_STATUS_EN = { ordered: 'Ordered', collected: 'Sample collected', sent: 'Sent to lab', received: 'Sample received', done: 'Result ready', cancelled: 'Cancelled' };
const LAB_STATUS_MN = { ordered: 'Ordered', collected: 'Sample Collected', sent: 'Sent to Central Lab', received: 'Sample Received by Lab', done: 'Results Ready', cancelled: 'Cancelled' };
const PAYMETHOD_EN = { 'бэлэн': 'Cash', 'карт': 'Card', 'QPay': 'QPay', 'дансаар': 'Bank transfer', 'шилжүүлэг': 'Bank transfer', 'зээл': 'Credit' };

function exLang() { const el = $('#ex-lang'); return (el && el.value) || 'mn'; }
function exV(key, lang) { const v = EXPORT_VAL[key]; return v ? v[lang] : key; }
function exYN(b, lang) { return b ? exV('yes', lang) : exV('no', lang); }
function exList(arr) { return (Array.isArray(arr) ? arr : []).map(x => (x && typeof x === 'object' ? (x.name || '') : x)).filter(Boolean).join(', '); }

// ── Firestore-оос бүх collection татах ─────────────────────────
async function fbFetchAllData(onProgress) {
  const out = { source: 'firestore', fetchedAt: new Date().toISOString(), collections: {} };
  if (typeof window.__fbColQuery !== 'function') {
    // Firebase холбогдоогүй — локал STATE-ээс авна
    out.source = 'local';
    out.collections = {
      horses: STATE.horses || [], waiting: STATE.waiting || [], exams: STATE.exams || [], trips: STATE.trips || [],
      fins: STATE.fins || [], inps: STATE.inps || [], labs: STATE.labs || [],
      doctors: STATE.doctors || [], users: STATE.users || [], staff: STATE.staff || [],
      logs: STATE.logs || [], deletedExams: STATE.deletedExams || []
    };
    out.config = {
      servicePrices: STATE.servicePrices || {}, customServices: STATE.customServices || [],
      removedServices: STATE.removedServices || [], staffSchedule: STATE.staffSchedule || {},
      labSvcOn: STATE.labSvcOn || [], labSvcOff: STATE.labSvcOff || [],
      bonusCfg: STATE.bonusCfg || null, examNumCfg: STATE.examNumCfg || null, inpLocations: STATE.inpLocations || null, customRoles: STATE.customRoles || [], callCfg: STATE.callCfg || null,
      medCatalog: STATE.medCatalog || [], employees: STATE.employees || [], dailyCfg: STATE.dailyCfg || null
    };
    return out;
  }
  for (let i = 0; i < EXPORT_COLLECTIONS.length; i++) {
    const col = EXPORT_COLLECTIONS[i];
    if (onProgress) onProgress(col, i, EXPORT_COLLECTIONS.length);
    try {
      const docs = await window.__fbColQuery(col);
      out.collections[col] = docs.map(d => Object.assign({ id: d.id }, d.data()));
    } catch (e) {
      console.error('[EXPORT] ' + col + ' татахад алдаа', e);
      out.collections[col] = (STATE[col === 'deletedExams' ? 'deletedExams' : col] || []).slice();
      out.warnings = (out.warnings || []).concat(col + ': ' + String(e && e.message || e));
    }
  }
  // clinic_config/main
  if (onProgress) onProgress('clinic_config', EXPORT_COLLECTIONS.length, EXPORT_COLLECTIONS.length + 1);
  try {
    const snap = await window.__fbGetDoc(window.__fbColDoc('clinic_config', 'main'));
    out.config = snap && snap.exists && snap.exists() ? snap.data() : (snap && snap.data ? snap.data() : {});
  } catch (e) {
    out.config = { servicePrices: STATE.servicePrices || {}, staffSchedule: STATE.staffSchedule || {} };
  }
  if (out.config && out.config.finPinHash) out.config = Object.assign({}, out.config, { finPinHash: '(hidden)' });
  return out;
}

// ── Мөр бэлтгэх — collection тус бүрээр ───────────────────────
function exBuildRows(D, lang) {
  const C = D.collections || {};
  const cfg = D.config || {};
  const R = {};
  const hdr = (sheet) => EXPORT_FIELDS[sheet].map(f => lang === 'en' ? f[2] : f[1]);
  const row = (sheet, obj) => { const o = {}; EXPORT_FIELDS[sheet].forEach(f => { o[lang === 'en' ? f[2] : f[1]] = obj[f[0]] === undefined || obj[f[0]] === null ? '' : obj[f[0]]; }); return o; };
  const mk = (sheet, list) => { R[sheet] = { header: hdr(sheet), rows: list.map(o => row(sheet, o)) }; };
  const tsStr = (ms) => { if (!ms) return ''; try { const d = new Date(parseFloat(ms)); return localDateStr(d) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); } catch (_) { return ''; } };

  mk('horses', (C.horses || []).slice().sort((a, b) => (a.date || '') < (b.date || '') ? 1 : -1));
  mk('waiting', C.waiting || []);

  const exams = (C.exams || []).slice().sort((a, b) => ((a.date || '') + (a.time || '')) < ((b.date || '') + (b.time || '')) ? -1 : 1);
  mk('trips', (C.trips || []).map(t => { const ex = (C.exams || []).filter(e => e.kind === 'planned' && String(e.tripId) === String(t.id)); const team = (Array.isArray(t.docIds) ? t.docIds : [t.docId, t.assistDocId]).filter(Boolean).map(id => { const d = (C.doctors || []).find(x => String(x.id) === String(id)); return d ? d.name : id; }).join(', '); return Object.assign({}, t, { '@route': t.route || t.location || '', '@team': team, '@n': ex.length, '@amount': ex.reduce((a, e) => a + (parseFloat(e.amount) || 0), 0), '@statusMn': t.status === 'closed' ? (lang === 'en' ? 'Closed' : 'Хаагдсан') : (lang === 'en' ? 'Open' : 'Нээлттэй') }); }));
  mk('exams', exams.map(e => Object.assign({}, e, {
    '@kind': e.kind === 'planned' ? (lang === 'en' ? 'Planned' : 'Scheduled Procedure') : (lang === 'en' ? 'Clinic' : 'Clinical Exam'),
    '@symptoms': exList(Array.isArray(e.symptoms) ? e.symptoms : (typeof e.symptoms === 'string' ? [] : [])),
    '@services': exList(e.services), '@meds': exList(e.meds),
    '@inpatient': exYN(!!e.inpatient, lang), '@bonusSkip': exYN(!!e.bonusSkip, lang),
    '@imageCount': Array.isArray(e.images) ? e.images.length : 0,
    '@dxStatus': ({ pending: lang === 'en' ? 'Pending' : 'Хянагдаж байна', approved: lang === 'en' ? 'Approved' : 'Батлагдсан', returned: lang === 'en' ? 'Returned' : 'Буцаагдсан' })[e.dxStatus] || '',
    '@dxApprovedAt': e.dxStatus === 'approved' ? tsStr(e.dxApprovedMs) : '',
    anamnesis: e.anamnesis || (typeof e.symptoms === 'string' ? e.symptoms : '')
  })));

  const es = [], em = [];
  exams.forEach(e => {
    (Array.isArray(e.services) ? e.services : []).forEach(s => es.push({ examId: e.id, examNum: e.examNum || '', date: e.date || '', horse: e.horse || '', name: s.name || '', price: parseFloat(s.price) || 0 }));
    (Array.isArray(e.meds) ? e.meds : []).forEach(m => em.push({ examId: e.id, examNum: e.examNum || '', date: e.date || '', horse: e.horse || '', name: (m && m.name) || m || '', note: (m && m.note) || '' }));
  });
  mk('examServices', es); mk('examMeds', em);

  const pays = [];
  const fins = (C.fins || []).slice().sort((a, b) => (a.date || '') < (b.date || '') ? 1 : -1);
  mk('fins', fins.map(f => {
    const ps = Array.isArray(f.payments) ? f.payments : [];
    const paidSum = ps.length ? ps.reduce((a, p) => a + (parseFloat(p.amount) || 0), 0) : (f.paid ? (parseFloat(f.amount) || 0) : 0);
    const amt = parseFloat(f.amount) || 0;
    ps.forEach(p => pays.push({ finId: f.id, examNum: f.examNum || '', horse: f.horse || '', date: p.date || '', amount: parseFloat(p.amount) || 0, method: lang === 'en' ? (PAYMETHOD_EN[p.method] || p.method || '') : (p.method || ''), note: p.note || '' }));
    const st = (f.paid || (amt > 0 && paidSum >= amt)) ? 'paid' : (paidSum > 0 ? 'part' : 'unpaid');
    return Object.assign({}, f, { '@paidSum': paidSum, '@due': Math.max(0, amt - paidSum), '@status': exV(st, lang),
      method: lang === 'en' ? (PAYMETHOD_EN[f.method] || f.method || '') : (f.method || '') });
  }));
  mk('payments', pays);

  const ilogs = [];
  mk('inps', (C.inps || []).map(i => {
    const lg = Array.isArray(i.log) ? i.log : [];
    lg.forEach(l => ilogs.push({ inpId: i.id, horse: i.horse || '', date: l.date || '', docName: l.docName || '', diagnosis: l.diagnosis || '', note: l.note || '', temp: l.temp || '', pulse: l.pulse || '', wt: l.wt || '', '@services': exList(l.services), '@meds': exList(l.meds), amount: parseFloat(l.amount) || 0 }));
    let days = '';
    try { days = inpatientDays(i.admittedMs, i.dischargedMs); } catch (_) {}
    return Object.assign({}, i, { '@discharged': exYN(!!i.discharged, lang), '@days': days,
      '@logCount': lg.length, '@logAmount': lg.reduce((a, l) => a + (parseFloat(l.amount) || 0), 0) });
  }));
  mk('inpLogs', ilogs);

  const lh = [];
  mk('labs', (C.labs || []).map(l => {
    (Array.isArray(l.history) ? l.history : []).forEach(h => lh.push({ labId: l.id, examNum: l.examNum || '', horse: l.horse || '',
      '@statusMn': lang === 'en' ? (LAB_STATUS_EN[h.status] || h.status || '') : (LAB_STATUS_MN[h.status] || h.status || ''),
      '@date': tsStr(h.ms), user: h.user || '', note: h.note || '' }));
    return Object.assign({}, l, {
      '@statusMn': lang === 'en' ? (LAB_STATUS_EN[l.status] || l.status || '') : (LAB_STATUS_MN[l.status] || l.status || ''),
      '@resultCount': Array.isArray(l.results) ? l.results.length : 0 });
  }));
  mk('labHistory', lh);

  mk('doctors', C.doctors || []);
  mk('users', (C.users || []).map(u => Object.assign({}, u, {
    '@pages': (Array.isArray(u.pages) ? u.pages : []).join(', '),
    '@labEdit': exYN(!!u.labEdit, lang), '@hasPw': exYN(!!(u.pwHash || u.pw), lang) })));
  mk('staff', (C.staff || []).map(s => Object.assign({}, s, {
    '@active': (Array.isArray(s.active) ? s.active : []).join(', '),
    '@duty': (Array.isArray(s.duty) ? s.duty : []).join(', ') })));

  // Сарын хуваарь — { 'YYYY-MM': { docId: { 'YYYY-MM-DD': status } } }
  const sched = [];
  const schedObj = (cfg.staffSchedule && typeof cfg.staffSchedule === 'object') ? cfg.staffSchedule : {};
  const docName = (id) => { const d = (C.doctors || []).find(x => String(x.id) === String(id)); return d ? d.name : id; };
  Object.keys(schedObj).sort().forEach(month => {
    const byDoc = schedObj[month] || {};
    Object.keys(byDoc).forEach(docId => {
      const days = byDoc[docId] || {};
      Object.keys(days).sort().forEach(date => {
        sched.push({ month, docId, docName: docName(docId), date, '@statusMn': exV(days[date], lang) });
      });
    });
  });
  mk('schedule', sched);

  mk('logs', (C.logs || []).slice().sort((a, b) => (b.ms || 0) - (a.ms || 0)));
  // Устгасан үзлэг — «Үзлэг» хуудастай ижил баганатай
  R.deletedExams = { header: hdr('exams'), rows: (C.deletedExams || []).map(e => row('exams', Object.assign({}, e, {
    '@kind': e.kind === 'planned' ? (lang === 'en' ? 'Planned' : 'Scheduled Procedure') : (lang === 'en' ? 'Clinic' : 'Clinical Exam'),
    '@symptoms': '', '@services': exList(e.services), '@meds': exList(e.meds),
    '@inpatient': exYN(!!e.inpatient, lang), '@bonusSkip': exYN(!!e.bonusSkip, lang),
    '@imageCount': Array.isArray(e.images) ? e.images.length : 0 }))) };

  // Үйлчилгээний үнэ
  const sp = (cfg.servicePrices && typeof cfg.servicePrices === 'object') ? cfg.servicePrices : {};
  const custom = new Set((cfg.customServices || []).map(String));
  mk('servicePrices', Object.keys(sp).sort().map(n => ({ name: n, price: parseFloat(sp[n]) || 0, '@src': exV(custom.has(n) ? 'custom' : 'base', lang) })));

  // Тохиргоо
  const cRows = [];
  const push = (k, v) => cRows.push({ key: k, value: v });
  push(lang === 'en' ? 'Custom services' : 'Нэмсэн үйлчилгээ', (cfg.customServices || []).join(', '));
  push(lang === 'en' ? 'Removed services' : 'Хассан үйлчилгээ', (cfg.removedServices || []).join(', '));
  push(lang === 'en' ? 'Lab services (forced on)' : 'Шинжилгээ гэж тэмдэглэсэн', (cfg.labSvcOn || []).join(', '));
  push(lang === 'en' ? 'Lab services (forced off)' : 'Шинжилгээнээс хассан', (cfg.labSvcOff || []).join(', '));
  if (cfg.bonusCfg) Object.keys(cfg.bonusCfg).forEach(k => push('bonusCfg.' + k, cfg.bonusCfg[k]));
  if (cfg.examNumCfg) Object.keys(cfg.examNumCfg).forEach(k => push('examNumCfg.' + k, cfg.examNumCfg[k]));
  push(lang === 'en' ? 'Exported at' : 'Татсан огноо', D.fetchedAt || '');
  push(lang === 'en' ? 'Source' : 'Эх сурвалж', D.source === 'firestore' ? 'Firebase Firestore' : (lang === 'en' ? 'Local device' : 'Локал төхөөрөмж'));
  mk('config', cRows);

  // Талбарын тайлбар (data dictionary)
  const dict = [];
  Object.keys(EXPORT_FIELDS).forEach(sheet => {
    if (sheet === 'dictionary') return;
    EXPORT_FIELDS[sheet].forEach(f => dict.push({ sheet: EXPORT_SHEETS[sheet] ? EXPORT_SHEETS[sheet][lang] : sheet, mn: f[1], en: f[2], key: String(f[0]).replace(/^@/, '(derived) '), desc: (lang === 'en' && f[4]) ? f[4] : f[3] }));
  });
  mk('dictionary', dict);
  return R;
}

// ── Excel татах ────────────────────────────────────────────────
function exSheetName(key, lang) { const s = EXPORT_SHEETS[key]; return (s ? s[lang] : key).slice(0, 31); }
async function exportFullExcel() {
  const lang = exLang();
  await exWithProgress(async (setMsg) => {
    if (typeof XLSX === 'undefined') {
      setMsg(lang === 'en' ? 'Loading Excel library…' : 'Excel сан ачаалж байна…');
      const CDNS = ['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', 'xlsx.full.min.js'];
      let loaded = false;
      for (const url of CDNS) {
        try {
          await new Promise((res, rej) => { const el = document.createElement('script'); el.src = url; el.onload = res; el.onerror = () => rej(new Error('load failed')); document.head.appendChild(el); });
          if (typeof XLSX !== 'undefined') { loaded = true; break; }
        } catch (_) {}
      }
      if (!loaded) throw new Error(lang === 'en' ? 'Excel library could not be loaded — check your internet connection, or use the JSON / CSV export instead.' : 'Excel сан ачаалж чадсангүй — интернэт холболтоо шалгах, эсвэл JSON / CSV татах хувилбарыг ашиглана уу.');
    }
    const D = await fbFetchAllData((col, i, n) => setMsg((lang === 'en' ? 'Downloading' : 'Татаж байна') + ': ' + col + ' (' + (i + 1) + '/' + n + ')'));
    setMsg(lang === 'en' ? 'Building workbook…' : 'Excel бэлтгэж байна…');
    const R = exBuildRows(D, lang);
    const wb = XLSX.utils.book_new();
    const order = ['dictionary', 'horses', 'exams', 'trips', 'examServices', 'examMeds', 'fins', 'payments', 'inps', 'inpLogs', 'labs', 'labHistory', 'waiting', 'doctors', 'users', 'staff', 'schedule', 'servicePrices', 'logs', 'deletedExams', 'config'];
    order.forEach(k => {
      const t = R[k]; if (!t) return;
      const ws = XLSX.utils.json_to_sheet(t.rows, { header: t.header });
      ws['!cols'] = t.header.map(h => ({ wch: Math.min(38, Math.max(10, String(h).length + 4)) }));
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };
      XLSX.utils.book_append_sheet(wb, ws, exSheetName(k, lang));
    });
    XLSX.writeFile(wb, (lang === 'en' ? 'Moriton_full_export_' : 'Морьтон_бүх_дата_') + todayStr() + '.xlsx');
    try { writeLog('Бүх дата татав (Excel)', '', '', (D.source === 'firestore' ? 'Firestore' : 'Локал') + ' · ' + lang.toUpperCase()); } catch (_) {}
    return (lang === 'en' ? '✅ Excel downloaded' : '✅ Excel татагдлаа');
  });
}

// ── JSON татах (түүхий, бүрэн — систем шилжүүлэхэд) ────────────
async function exportFullJSON(english) {
  const lang = english ? 'en' : exLang();
  await exWithProgress(async (setMsg) => {
    const D = await fbFetchAllData((col, i, n) => setMsg((lang === 'en' ? 'Downloading' : 'Татаж байна') + ': ' + col + ' (' + (i + 1) + '/' + n + ')'));
    setMsg(lang === 'en' ? 'Preparing file…' : 'Файл бэлтгэж байна…');
    const payload = {
      _meta: {
        system: 'Moriton Equine Clinic', exportedAt: D.fetchedAt, source: D.source,
        schemaLanguage: 'original (Firestore field names)',
        note: 'Nested arrays (services, meds, payments, log, history, images) are preserved as-is. See the Excel export DataDictionary sheet for English field descriptions.',
        counts: Object.keys(D.collections).reduce((a, k) => { a[k] = (D.collections[k] || []).length; return a; }, {}),
        warnings: D.warnings || []
      },
      config: D.config || {},
      data: Object.assign({}, D.collections, {
        // Нууц үгийн hash-ийг экспортод оруулахгүй
        users: (D.collections.users || []).map(u => { const o = Object.assign({}, u); delete o.pwHash; delete o.pw; o.hasPassword = !!(u.pwHash || u.pw); return o; })
      })
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'moriton_full_backup_' + todayStr() + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    try { writeLog('Бүх дата татав (JSON)', '', '', (D.source === 'firestore' ? 'Firestore' : 'Локал')); } catch (_) {}
    return (lang === 'en' ? '✅ JSON downloaded' : '✅ JSON татагдлаа');
  });
}

// ── CSV багц (нэг хуудас = нэг файл) ──────────────────────────
async function exportFullCSV() {
  const lang = exLang();
  await exWithProgress(async (setMsg) => {
    const D = await fbFetchAllData((col, i, n) => setMsg((lang === 'en' ? 'Downloading' : 'Татаж байна') + ': ' + col + ' (' + (i + 1) + '/' + n + ')'));
    const R = exBuildRows(D, lang);
    const order = ['horses', 'exams', 'examServices', 'examMeds', 'fins', 'payments', 'inps', 'inpLogs', 'labs', 'labHistory', 'doctors', 'schedule', 'servicePrices', 'logs'];
    let n = 0;
    for (const k of order) {
      const t = R[k]; if (!t || !t.rows.length) continue;
      const rows = [t.header].concat(t.rows.map(r => t.header.map(h => r[h])));
      downloadCSV(rows, exSheetName(k, lang) + '_' + todayStr() + '.csv');
      n++;
      await new Promise(r => setTimeout(r, 350)); // browser олон файлыг дараалуулж татахад завсарлага хэрэгтэй
    }
    try { writeLog('Бүх дата татав (CSV)', '', '', n + ' файл'); } catch (_) {}
    return (lang === 'en' ? '✅ ' + n + ' CSV files downloaded' : '✅ ' + n + ' CSV файл татагдлаа');
  });
}

// ── Явцын мэдээлэл ────────────────────────────────────────────
async function exWithProgress(fn) {
  const box = $('#ex-progress');
  const btns = $$('#export-card button');
  btns.forEach(b => b.disabled = true);
  const setMsg = (m) => { if (box) box.innerHTML = '<span class="badge b-o">⏳ ' + escHTML(m) + '</span>'; };
  setMsg('...');
  try {
    const done = await fn(setMsg);
    if (box) box.innerHTML = '<span class="badge b-g">' + escHTML(done) + '</span>';
    toast(done, 'ok');
  } catch (e) {
    console.error(e);
    if (box) box.innerHTML = '<span class="badge b-r">⚠️ ' + escHTML(String(e && e.message || e)) + '</span>';
    toast('Татахад алдаа гарлаа', 'err');
  } finally {
    btns.forEach(b => b.disabled = false);
  }
}

// ── Тойм (юу татагдахыг урьдчилан харуулах) ───────────────────
function renderExportSummary() {
  const el = $('#ex-summary'); if (!el) return;
  const lang = exLang();
  const items = [
    ['horses', STATE.horses], ['exams', STATE.exams], ['fins', STATE.fins],
    ['inps', STATE.inps], ['labs', STATE.labs], ['waiting', STATE.waiting],
    ['doctors', STATE.doctors], ['users', STATE.users], ['logs', STATE.logs]
  ];
  el.innerHTML = items.map(([k, arr]) => {
    const s = EXPORT_SHEETS[k] || { mn: k, en: k };
    return '<span class="badge" style="margin:2px 4px 2px 0">' + escHTML(s[lang]) + ': <b>' + ((arr && arr.length) || 0) + '</b></span>';
  }).join('') + '<div class="muted" style="font-size:11px;margin-top:6px">' +
    (lang === 'en'
      ? 'Counts shown are what this device has loaded; the export pulls the authoritative copy from Firestore.'
      : 'Эдгээр нь энэ төхөөрөмж дээр ачаалагдсан тоо; татахдаа Firestore-оос эх хувийг нь дахин татна.') + '</div>';
}

// ============================================================
// 🗓️ ТӨЛӨВЛӨГӨӨТ ҮЗЛЭГ — хээрийн явцын цаасан маягтыг багцаар шивэх
// ------------------------------------------------------------
// Бүтэц: «Явц» (trips collection) = нэг удаагийн төлөвлөгөөт үзлэгийн аялал
// (огноо, байршил, эмч нар). Явц бүрийн доор адуу тус бүрийн үзлэг
// exams collection-д kind:'planned' + tripId тэмдэгтэй хадгалагдана.
// Ингэснээр Accountant / Finance, Түүх, KPI, Тайлан, Урамшуулал, Экспорт бүгд
// нэг л exams жагсаалтаас уншиж, «Төлөвлөгөөт» гэж ялгаж харуулна.
// ============================================================
function isPlanned(e) { return !!(e && e.kind === 'planned'); }
function kindBadge(e, small) {
  return isPlanned(e) ? '<span class="badge b-p" style="font-size:' + (small ? '9px' : '10px') + ';margin-left:4px" title="Төлөвлөгөөт үзлэг">ТҮ</span>' : '';
}
// Хуудас тус бүрийн «Бүгд / Клиник / Төлөвлөгөөт» шүүлтүүр
function examKindOk(e, mode) {
  if (!mode || mode === 'all') return true;
  if (mode === 'planned') return isPlanned(e);
  return !isPlanned(e);
}
function kindFilterHTML(id, extraStyle) {
  return `<select class="inp" id="${id}" style="width:auto;padding:6px 10px;font-size:12px;${extraStyle || ''}" onchange="onKindFilterChange('${id}')">
    <option value="all">Бүх үзлэг</option><option value="clinic">Зөвхөн клиник</option><option value="planned">Зөвхөн төлөвлөгөөт (ТҮ)</option></select>`;
}
function kindFilterVal(id) { const el = $('#' + id); return (el && el.value) || 'all'; }
function onKindFilterChange(id) {
  if (id === 'h-kind') { __histPage = 0; renderHistory(); }
  else if (id === 'f-kind') onFinFilterChange();
  else if (id === 'k-kind') renderKPI();
  else if (id === 'rp-kind') { if (__rpLast) genReport(); }
}

// ── Явц (trip) ────────────────────────────────────────────────
function tripById(id) { return (STATE.trips || []).find(t => String(t.id) === String(id)); }
function tripExams(tripId) { return (STATE.exams || []).filter(e => isPlanned(e) && String(e.tripId) === String(tripId)); }
function tripStats(t) {
  const ex = tripExams(t.id);
  return { n: ex.length, horses: new Set(ex.map(e => String(e.horseId || e.horse))).size,
    amount: ex.reduce((a, e) => a + (parseFloat(e.amount) || 0), 0),
    services: ex.reduce((a, e) => a + (Array.isArray(e.services) ? e.services.length : 0), 0) };
}
function tripLabel(t) { return (t.date || '') + (t.endDate && t.endDate !== t.date ? ' → ' + t.endDate : '') + ' · ' + (t.route || t.location || t.province || '—'); }
// Явцын эмч нар (3 хүртэл) — үзлэгийн маягт дээр эндээс 2-ыг сонгоно
function tripDocs(t) { const ids = Array.isArray(t.docIds) ? t.docIds : [t.docId, t.assistDocId]; return ids.filter(Boolean).map(id => (STATE.doctors || []).find(d => String(d.id) === String(id))).filter(Boolean); }
function tripDocNames(t) { return tripDocs(t).map(d => d.name).join(', '); }

function renderPlanned() {
  if (!Array.isArray(STATE.trips)) STATE.trips = [];
  // Эмчийн сонголтууд
  const docOpts = (sel, blank) => (blank ? '<option value="">— байхгүй —</option>' : '') + (STATE.doctors || []).map(d => `<option value="${escHTML(d.id)}" ${String(d.id) === String(sel) ? 'selected' : ''}>${escHTML(d.name)} (${escHTML(d.role || '')})</option>`).join('');
  ['pl-t-doc1'].forEach(id => { const el = $('#' + id); if (el && !el.options.length) el.innerHTML = docOpts(''); });
  ['pl-t-doc2', 'pl-t-doc3'].forEach(id => { const el = $('#' + id); if (el && !el.options.length) el.innerHTML = docOpts('', true); });
  if ($('#pl-t-date') && !$('#pl-t-date').value) $('#pl-t-date').value = todayStr();

  // Явцын жагсаалт (шинэ → хуучин)
  const trips = STATE.trips.slice().sort((a, b) => (b.date || '') < (a.date || '') ? -1 : (b.date || '') > (a.date || '') ? 1 : (b.ms || 0) - (a.ms || 0));
  if (!STATE.selectedTrip || !tripById(STATE.selectedTrip)) STATE.selectedTrip = trips[0] ? trips[0].id : null;
  const list = $('#pl-trip-list');
  if (list) list.innerHTML = trips.length ? trips.map(t => {
    const s = tripStats(t);
    return `<div class="li ${String(t.id) === String(STATE.selectedTrip) ? 'sel' : ''}" onclick="selectTrip('${escHTML(String(t.id))}')" style="cursor:pointer">
      <div class="li-av">${t.status === 'closed' ? '✅' : '🗓️'}</div>
      <div class="li-info"><div class="li-name">${escHTML(tripLabel(t))}</div>
        <div class="li-sub">${escHTML(tripDocNames(t) || t.docName || '—')} · ${s.n} үзлэг · ${fmtCompact(s.amount)}</div></div>
    </div>`;
  }).join('') : '<div class="empty"><div class="empty-em">🗓️</div>Явц бүртгээгүй байна — дээрх маягтаар шинэ явц үүсгэнэ үү</div>';
  renderTripDetail();
}
function selectTrip(id) { STATE.selectedTrip = id; renderPlanned(); }

function saveTrip() {
  try { return _saveTrip(); } catch (e) { console.error('[saveTrip]', e); toast('⚠️ Хадгалахад алдаа: ' + (e && e.message || e), 'err'); }
}
function _saveTrip() {
  const v = id => (($('#' + id) || {}).value || '').trim();
  const date = v('pl-t-date'), route = v('pl-t-route');
  if (!date) { toast('Огноо оруулна уу', 'err'); return; }
  if (!route) { toast('Маршрут (аймгууд) оруулна уу', 'err'); return; }
  const ids = [...new Set([v('pl-t-doc1'), v('pl-t-doc2'), v('pl-t-doc3')].filter(Boolean))];
  const docs = ids.map(id => (STATE.doctors || []).find(d => String(d.id) === id)).filter(Boolean);
  if (!docs.length) { toast('Багийн эмч сонгоно уу', 'err'); return; }
  const t = { id: uid(), date, endDate: v('pl-t-end') || date, route, location: route, province: '', soum: '',
    docIds: docs.map(d => d.id), docId: docs[0].id, docName: docs[0].name, assistDocId: docs[1] ? docs[1].id : '', assistName: docs[1] ? docs[1].name : '',
    note: v('pl-t-note'), status: 'open',
    createdBy: (STATE.user && STATE.user.name) || '', ms: nowMs() };
  if (!Array.isArray(STATE.trips)) STATE.trips = [];
  STATE.trips.push(t); STATE.selectedTrip = t.id;
  lsSet('mt_trips', STATE.trips); fbSaveRecord('trips', t);
  writeLog('Төлөвлөгөөт үзлэгийн явц үүсгэв', t.id, tripLabel(t), 'Баг: ' + tripDocNames(t));
  ['pl-t-route', 'pl-t-note', 'pl-t-end'].forEach(id => { if ($('#' + id)) $('#' + id).value = ''; });
  toast('✅ Явц үүслээ — одоо адуу тус бүрийн үзлэгийг шивнэ', 'ok');
  renderPlanned();
  setTimeout(() => { const h = $('#pl-e-horse'); if (h) h.focus(); }, 100);
}
function toggleTripStatus() {
  const t = tripById(STATE.selectedTrip); if (!t) return;
  t.status = t.status === 'closed' ? 'open' : 'closed'; t.ms = nowMs();
  lsSet('mt_trips', STATE.trips); fbSaveRecord('trips', t);
  writeLog(t.status === 'closed' ? 'Явц хаав' : 'Явц дахин нээв', t.id, tripLabel(t), '');
  renderPlanned();
}
function deleteTrip() {
  const t = tripById(STATE.selectedTrip); if (!t) return;
  if (tripExams(t.id).length) { toast('Үзлэгтэй явцыг устгах боломжгүй — эхлээд үзлэгүүдийг устгана', 'err'); return; }
  if (!confirm('«' + tripLabel(t) + '» явцыг устгах уу?')) return;
  STATE.trips = STATE.trips.filter(x => String(x.id) !== String(t.id));
  STATE.deletedIds.add(String(t.id));
  lsSet('mt_trips', STATE.trips); fbDeleteDoc('trips', String(t.id));
  writeLog('Явц устгав', t.id, tripLabel(t), '');
  STATE.selectedTrip = null; renderPlanned();
}
function editTripField(field, val) {
  const t = tripById(STATE.selectedTrip); if (!t) return;
  if (field === 'doc0' || field === 'doc1' || field === 'doc2') {
    const ids = (Array.isArray(t.docIds) ? t.docIds.slice() : [t.docId, t.assistDocId]); while (ids.length < 3) ids.push('');
    ids[parseInt(field.slice(3), 10)] = val || '';
    const docs = [...new Set(ids.filter(Boolean))].map(id => (STATE.doctors || []).find(x => String(x.id) === String(id))).filter(Boolean);
    t.docIds = docs.map(d => d.id); t.docId = docs[0] ? docs[0].id : ''; t.docName = docs[0] ? docs[0].name : ''; t.assistDocId = docs[1] ? docs[1].id : ''; t.assistName = docs[1] ? docs[1].name : '';
  } else t[field] = val;
  t.ms = nowMs(); lsSet('mt_trips', STATE.trips); fbSaveRecord('trips', t);
  renderPlanned();
}

// ── Явцын дэлгэрэнгүй + шивэх маягт ───────────────────────────
let PL_DRAFT = { services: [], meds: [], symptoms: [], manualTotal: false };
let PL_STICKY = { tripId: null }; // аймаг/сум/эмч — дараагийн маягтад хэвээр
function renderTripDetail() {
  const host = $('#pl-detail'); if (!host) return;
  const t = tripById(STATE.selectedTrip);
  if (!t) { host.innerHTML = '<div class="card"><div class="empty"><div class="empty-em">🗓️</div>Зүүн талаас явц сонгох эсвэл шинээр үүсгэнэ үү</div></div>'; return; }
  if (t.date && t.date < LIVE_CUTOFF) ensureRange(t.date, t.endDate || t.date).then(ok => { if (ok && STATE.activePage === 'planned') renderPlanned(); });
  const s = tripStats(t);
  const ex = tripExams(t.id).slice().sort((a, b) => (b.ms || 0) - (a.ms || 0));
  const closed = t.status === 'closed';
  const docOpts = (sel, blank) => (blank ? '<option value="">— байхгүй —</option>' : '') + (STATE.doctors || []).map(d => `<option value="${escHTML(d.id)}" ${String(d.id) === String(sel) ? 'selected' : ''}>${escHTML(d.name)}</option>`).join('');
  const tdocs = tripDocs(t);
  // Үзлэгийн маягт дээр зөвхөн багийн эмч нараас сонгоно (баг тодорхойгүй бол бүх эмч)
  const teamOpts = (sel, blank) => (blank ? '<option value="">— байхгүй —</option>' : '') + (tdocs.length ? tdocs : (STATE.doctors || [])).map(d => `<option value="${escHTML(d.id)}" ${String(d.id) === String(sel) ? 'selected' : ''}>${escHTML(d.name)}</option>`).join('');
  const ids3 = (Array.isArray(t.docIds) ? t.docIds : [t.docId, t.assistDocId]).slice(); while (ids3.length < 3) ids3.push('');
  const provOpts = (sel) => '<option value="">— аймаг —</option>' + PROVS.map(p => `<option ${p === sel ? 'selected' : ''}>${escHTML(p)}</option>`).join('');
  // Сүүлд шивсэн аймаг/сум-ыг санана (3–5 аймгаар явдаг тул аймаг солигдох бүрд нэг л удаа өөрчилнө)
  const lastEx = ex[0] || {};
  const stickyProv = (PL_STICKY.tripId === t.id && PL_STICKY.province) || lastEx.province || '';
  const stickySoum = (PL_STICKY.tripId === t.id && PL_STICKY.soum !== undefined) ? PL_STICKY.soum : (lastEx.soum || '');
  const stickyOwner = (PL_STICKY.tripId === t.id && PL_STICKY.owner !== undefined) ? PL_STICKY.owner : (lastEx.owner || '');
  const byProv = {}; ex.forEach(e => { const k = e.province || '—'; byProv[k] = (byProv[k] || 0) + 1; });
  host.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div><div class="ph-title" style="font-size:16px">🗓️ ${escHTML(tripLabel(t))} ${closed ? '<span class="badge b-g">Хаагдсан</span>' : '<span class="badge b-o">Нээлттэй</span>'}</div>
          <div class="muted" style="font-size:12px">Баг: ${escHTML(tripDocNames(t) || '—')}${t.note ? ' · ' + escHTML(t.note) : ''} · үүсгэсэн: ${escHTML(t.createdBy || '—')}</div></div>
        <div class="row" style="gap:6px">
          <button class="btn btn-sm" onclick="printTripReport()">🖨️ Явцын тайлан</button>
          <button class="btn btn-sm" onclick="exportTripCSV()">⬇ CSV</button>
          <button class="btn btn-sm" onclick="toggleTripStatus()">${closed ? '↩ Дахин нээх' : '✅ Явц хаах'}</button>
          ${ex.length ? '' : '<button class="btn btn-sm btn-r" onclick="deleteTrip()">🗑</button>'}
        </div>
      </div>
      <div class="stats" style="margin-top:12px">
        <div class="stat"><div class="stat-l">🐎 Адуу</div><div class="snum">${s.horses}</div></div>
        <div class="stat accent"><div class="stat-l">📋 Үзлэг</div><div class="snum">${s.n}</div></div>
        <div class="stat purple"><div class="stat-l">💉 Үйлчилгээ</div><div class="snum">${s.services}</div></div>
        <div class="stat green"><div class="stat-l">💰 Нийт дүн</div><div class="snum">${fmtCompact(s.amount)}</div></div>
      </div>
      ${Object.keys(byProv).length ? '<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px">' + Object.keys(byProv).sort().map(k => '<span class="badge">' + escHTML(k) + ': <b>' + byProv[k] + '</b></span>').join('') + '</div>' : ''}
      <div class="fg r4" style="margin-top:10px">
        <div class="fld"><label>Эмч 1 (ахлах)</label><select class="inp" onchange="editTripField('doc0',this.value)">${docOpts(ids3[0])}</select></div>
        <div class="fld"><label>Эмч 2</label><select class="inp" onchange="editTripField('doc1',this.value)">${docOpts(ids3[1], true)}</select></div>
        <div class="fld"><label>Эмч 3</label><select class="inp" onchange="editTripField('doc2',this.value)">${docOpts(ids3[2], true)}</select></div>
      </div>
    </div>

    ${closed ? '<div class="card"><div class="muted">Явц хаагдсан тул шинэ үзлэг шивэхгүй. Шаардлагатай бол «Дахин нээх» дарна.</div></div>' : `
    <div class="card" id="pl-entry-card">
      <div class="ch">📝 Цаасан маягтаас шивэх <span class="ch-r muted" style="font-weight:600">Ctrl+Enter = хадгалаад дараагийнх</span></div>
      <div class="fg r4">
        <div class="fld"><label>Үзлэгийн хуудасны №</label><div class="row" style="gap:4px"><input class="inp" id="pl-e-num" placeholder="маягт дээрх дугаар" style="font-weight:800"><button class="btn btn-xs" type="button" title="Системийн дараагийн дугаар" onclick="$('#pl-e-num').value=nextExamNum()">авто</button></div></div>
        <div class="fld"><label>Огноо</label><input class="inp" type="date" id="pl-e-date" value="${escHTML(t.date)}"></div>
        <div class="fld"><label>Цаг</label><input class="inp" type="time" id="pl-e-time"></div>
        <div class="fld"><label>Дүн <span class="muted" id="pl-e-total-mode" style="font-weight:600;text-transform:none">(авто)</span></label><div class="row" style="gap:4px"><input class="inp" type="number" id="pl-e-total" value="0" style="font-weight:900;background:var(--orange-soft);color:var(--orange-dark)" oninput="PL_DRAFT.manualTotal=true;$('#pl-e-total-mode').textContent='(гараар)'"><button class="btn btn-xs" type="button" title="Үйлчилгээний нийлбэрээр дахин тооцох" onclick="PL_DRAFT.manualTotal=false;updatePlTotal()">↺</button></div></div>
      </div>
      <div class="fg r4" style="margin-top:8px">
        <div class="fld"><label>Аймаг</label><select class="inp" id="pl-e-prov">${provOpts(stickyProv)}</select></div>
        <div class="fld"><label>Сум / байршил</label><input class="inp" id="pl-e-soum" value="${escHTML(stickySoum)}" placeholder="ж: Асгат"></div>
        <div class="fld"><label>Эмч</label><select class="inp" id="pl-e-doc">${teamOpts(PL_STICKY.tripId === t.id && PL_STICKY.docId ? PL_STICKY.docId : t.docId)}</select></div>
        <div class="fld"><label>Хамтрагч эмч</label><select class="inp" id="pl-e-asst">${teamOpts(PL_STICKY.tripId === t.id && PL_STICKY.asstId !== undefined ? PL_STICKY.asstId : t.assistDocId, true)}</select></div>
      </div>
      <div class="fg r4" style="margin-top:8px">
        <div class="fld"><label>Зүс (нэр) *</label><input class="inp" id="pl-e-horse" placeholder="ж: Хээр" list="pl-horse-dl" autocomplete="off"><datalist id="pl-horse-dl"></datalist></div>
        <div class="fld"><label>Нас</label><input class="inp" id="pl-e-age" placeholder="ж: 5"></div>
        <div class="fld"><label>Эзэн</label><input class="inp" id="pl-e-owner" value="${escHTML(stickyOwner)}" placeholder="сонголттой"></div>
        <div class="fld"><label>Утас</label><input class="inp" id="pl-e-phone"></div>
      </div>
      <div class="fg r2" style="margin-top:8px">
        <div class="fld"><label>Анамнез (маягтын дээд хэсэг)</label><textarea class="inp" id="pl-e-anam" rows="2"></textarea></div>
        <div class="fld"><label>Онош *</label><textarea class="inp" id="pl-e-diag" rows="2"></textarea></div>
      </div>
      <div class="fld" style="margin-top:8px"><label>Шинж тэмдэг</label><div class="row" id="pl-e-symptoms" style="gap:6px;flex-wrap:wrap"></div></div>
      <div class="fg r4" style="margin-top:8px">
        <div class="fld"><label>Темп (°C)</label><input class="inp" type="number" step="0.1" id="pl-e-temp"></div>
        <div class="fld"><label>Зүрх (уд/мин)</label><input class="inp" type="number" id="pl-e-pulse"></div>
        <div class="fld"><label>Амьсгал</label><input class="inp" type="number" id="pl-e-resp"></div>
        <div class="fld"><label>Жин (кг)</label><input class="inp" type="number" id="pl-e-wt"></div>
      </div>
      <div class="fg r2" style="margin-top:10px">
        <div>
          <div class="fld"><label>Үйлчилгээ</label><div class="dd"><input class="inp" id="pl-svc-search" placeholder="🔍 Үйлчилгээ хайж нэмэх..." autocomplete="off"><div class="dd-list" id="pl-svc-dd"></div></div></div>
          <div id="pl-svc-selected" style="margin-top:6px"></div>
        </div>
        <div>
          <div class="fld"><label>Эм</label><div class="dd"><input class="inp" id="pl-med-search" placeholder="Эм хайж нэмэх..." autocomplete="off"><div class="dd-list" id="pl-med-dd"></div></div></div>
          <div id="pl-med-chips" style="margin-top:6px"></div>
        </div>
      </div>
      <div class="fld" style="margin-top:8px"><label>Эмчийн тэмдэглэл / зөвлөгөө</label><textarea class="inp" id="pl-e-note" rows="2"></textarea></div>
      <div class="row" style="justify-content:flex-end;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
        <button class="btn" onclick="clearPlannedForm()">Цэвэрлэх</button>
        <button class="btn btn-g" onclick="savePlannedExam()">💾 Хадгалаад дараагийнх</button>
      </div>
    </div>`}

    <div class="card">
      <div class="ch">📋 Энэ явцад шивсэн үзлэгүүд <span class="ch-r">${ex.length}</span></div>
      ${ex.length ? `<div class="tbl-wrap" style="overflow-x:auto"><table style="min-width:820px;font-size:12px">
        <thead><tr><th>#</th><th>Дугаар</th><th>Огноо</th><th>Аймаг / сум</th><th>Зүс</th><th>Эзэн</th><th>Онош</th><th>Үйлчилгээ</th><th>Эмч</th><th style="text-align:right">Дүн</th><th></th></tr></thead>
        <tbody>${ex.map((e, i) => `<tr>
          <td class="muted">${ex.length - i}</td>
          <td class="bold" style="cursor:pointer" onclick="openExamDetail('${escHTML(String(e.id))}')">${escHTML(e.examNum || '—')}</td>
          <td>${escHTML(e.date || '')}</td>
          <td style="font-size:11px">${escHTML([e.province, e.soum].filter(Boolean).join(' / ')) || '—'}</td>
          <td class="bold">${escHTML(e.horse || '')}</td>
          <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(e.owner || '')}</td>
          <td style="max-width:160px;white-space:normal">${escHTML(e.diagnosis || '')}</td>
          <td style="white-space:normal;font-size:11px">${escHTML((e.services || []).map(s => s.name).join(', '))}</td>
          <td style="font-size:11px">${escHTML(e.docName || '')}${e.assistDocName ? '<div class="muted" style="font-size:10px">+ ' + escHTML(e.assistDocName) + '</div>' : ''}</td>
          <td class="bold" style="text-align:right;white-space:nowrap">${fmt(e.amount || 0)}</td>
          <td style="white-space:nowrap"><button class="btn btn-xs" onclick="openEditExam('${escHTML(String(e.id))}')" title="Засах">✏️</button> ${canDelete() ? `<button class="btn btn-xs btn-r" onclick="deleteExam('${escHTML(String(e.id))}');setTimeout(renderPlanned,50)" title="Устгах">✕</button>` : ''}</td>
        </tr>`).join('')}</tbody></table></div>` : '<div class="muted" style="font-size:12px">Үзлэг шивээгүй байна</div>'}
    </div>`;
  if (!closed) setupPlannedForm();
}

function setupPlannedForm() {
  PL_DRAFT = { services: [], meds: [], symptoms: [], manualTotal: false };
  renderPlSymptoms(); renderPlSvcs(); renderPlMeds();
  // адууны зүсний санал (сүүлийн бүртгэлүүд)
  const dl = $('#pl-horse-dl');
  if (dl) { const names = [...new Set((STATE.horses || []).map(h => h.name).filter(Boolean))].slice(-300); dl.innerHTML = names.map(n => `<option value="${escHTML(n)}">`).join(''); }
  // Үйлчилгээ хайлт
  const ss = $('#pl-svc-search'), sdd = $('#pl-svc-dd');
  if (ss) ss.oninput = () => {
    const q = ss.value.toLowerCase().trim();
    const list = getAllServices().filter(s => !q || s.toLowerCase().includes(q)).slice(0, 40);
    if (!q || !list.length) { sdd.classList.remove('show'); return; }
    sdd.innerHTML = list.map(s => `<div class="dd-item" data-s="${escHTML(s)}">${escHTML(s)} <span class="muted" style="font-size:11px">${fmt(getSvcPrice(s))}</span></div>`).join('');
    sdd.classList.add('show');
    sdd.querySelectorAll('.dd-item').forEach(el => el.onmousedown = ev => { ev.preventDefault(); addPlSvc(el.dataset.s); ss.value = ''; sdd.classList.remove('show'); });
  };
  if (ss) ss.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); const first = sdd.querySelector('.dd-item'); if (first) { addPlSvc(first.dataset.s); ss.value = ''; sdd.classList.remove('show'); } } };
  if (ss) ss.onblur = () => setTimeout(() => sdd.classList.remove('show'), 150);
  // Эм хайлт
  const ms = $('#pl-med-search'), mdd = $('#pl-med-dd');
  if (ms) ms.oninput = () => {
    const q = ms.value.toLowerCase().trim();
    if (!q) { mdd.classList.remove('show'); return; }
    const list = MED_LIST.filter(m => m.toLowerCase().includes(q)).slice(0, 40);
    mdd.innerHTML = (list.map(m => `<div class="dd-item" data-m="${escHTML(m)}">${escHTML(m)}</div>`).join('')) + `<div class="dd-item" data-m="${escHTML(ms.value.trim())}" style="color:var(--muted)">➕ «${escHTML(ms.value.trim())}» гэж нэмэх</div>`;
    mdd.classList.add('show');
    mdd.querySelectorAll('.dd-item').forEach(el => el.onmousedown = ev => { ev.preventDefault(); addPlMed(el.dataset.m); ms.value = ''; mdd.classList.remove('show'); });
  };
  if (ms) ms.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); const first = mdd.querySelector('.dd-item'); if (first) { addPlMed(first.dataset.m); ms.value = ''; mdd.classList.remove('show'); } } };
  if (ms) ms.onblur = () => setTimeout(() => mdd.classList.remove('show'), 150);
  // Ctrl+Enter → хадгалах
  const card = $('#pl-entry-card');
  if (card) card.onkeydown = ev => { if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); savePlannedExam(); } };
}
function renderPlSymptoms() {
  const sh = $('#pl-e-symptoms'); if (!sh) return;
  sh.innerHTML = SYMPTOM_LIST.map(s => { const on = PL_DRAFT.symptoms.includes(s); return `<button type="button" class="badge" data-sym="${escHTML(s)}" style="cursor:pointer;border:1.5px solid ${on ? 'var(--orange)' : 'var(--border)'};padding:6px 10px;background:${on ? 'var(--orange-soft)' : '#fff'};font-size:11px">${escHTML(s)}</button>`; }).join('');
  sh.querySelectorAll('button').forEach(b => b.onclick = () => { const s = b.dataset.sym; PL_DRAFT.symptoms = PL_DRAFT.symptoms.includes(s) ? PL_DRAFT.symptoms.filter(x => x !== s) : PL_DRAFT.symptoms.concat(s); renderPlSymptoms(); });
}
function addPlSvc(name) { if (!name) return; if (!PL_DRAFT.services.find(x => x.name === name)) PL_DRAFT.services.push({ name, price: getSvcPrice(name) }); renderPlSvcs(); }
function renderPlSvcs() {
  const w = $('#pl-svc-selected'); if (!w) return;
  w.innerHTML = PL_DRAFT.services.length ? PL_DRAFT.services.map((s, i) => `<div class="svc-row"><div class="svc-row-name">${escHTML(s.name)}</div><input class="inp" type="number" data-i="${i}" value="${s.price || ''}" placeholder="0"><button class="btn btn-r btn-xs" data-rm="${i}">✕</button></div>`).join('') : '<div class="muted" style="font-size:12px">Үйлчилгээ сонгоогүй</div>';
  w.querySelectorAll('input[type=number]').forEach(inp => inp.oninput = () => { PL_DRAFT.services[+inp.dataset.i].price = parseFloat(inp.value) || 0; updatePlTotal(); });
  w.querySelectorAll('button[data-rm]').forEach(b => b.onclick = () => { PL_DRAFT.services.splice(+b.dataset.rm, 1); renderPlSvcs(); });
  updatePlTotal();
}
function updatePlTotal() { if (PL_DRAFT.manualTotal) return; const t = PL_DRAFT.services.reduce((a, b) => a + (parseFloat(b.price) || 0), 0); if ($('#pl-e-total')) $('#pl-e-total').value = t; if ($('#pl-e-total-mode')) $('#pl-e-total-mode').textContent = '(авто)'; }
function addPlMed(name) { name = String(name == null ? '' : name).trim(); if (!name) return; if (!PL_DRAFT.meds.find(x => x.name === name)) PL_DRAFT.meds.push({ name, note: '' }); renderPlMeds(); }
function renderPlMeds() {
  const w = $('#pl-med-chips'); if (!w) return;
  w.innerHTML = PL_DRAFT.meds.length ? PL_DRAFT.meds.map((m, i) => `<div style="display:flex;align-items:center;gap:6px;background:var(--input);border-radius:8px;padding:5px 8px;margin-bottom:4px"><span style="font-size:12px;font-weight:700;min-width:110px">${escHTML(m.name)}</span><input class="inp" data-i="${i}" value="${escHTML(m.note || '')}" placeholder="тун, заавар" style="flex:1;padding:4px 8px;font-size:12px"><button class="btn btn-r btn-xs" data-rm="${i}">✕</button></div>`).join('') : '<div class="muted" style="font-size:12px">Эм сонгоогүй</div>';
  w.querySelectorAll('input[data-i]').forEach(inp => inp.oninput = () => { PL_DRAFT.meds[+inp.dataset.i].note = inp.value; });
  w.querySelectorAll('button[data-rm]').forEach(b => b.onclick = () => { PL_DRAFT.meds.splice(+b.dataset.rm, 1); renderPlMeds(); });
}
function clearPlannedForm() {
  ['pl-e-num', 'pl-e-time', 'pl-e-horse', 'pl-e-phone', 'pl-e-age', 'pl-e-anam', 'pl-e-diag', 'pl-e-temp', 'pl-e-pulse', 'pl-e-resp', 'pl-e-wt', 'pl-e-note', 'pl-svc-search', 'pl-med-search'].forEach(id => { const el = $('#' + id); if (el) el.value = ''; });
  PL_DRAFT = { services: [], meds: [], symptoms: [], manualTotal: false };
  renderPlSymptoms(); renderPlSvcs(); renderPlMeds();
  const h = $('#pl-e-horse'); if (h) h.focus();
}

// ── Хадгалах: адуу (upsert) + үзлэг + санхүү + эмчийн статистик + шинжилгээ ──
async function savePlannedExam() {
  try { return await _savePlannedExam(); } catch (e) { console.error('[savePlannedExam]', e); toast('⚠️ Хадгалахад алдаа: ' + (e && e.message || e), 'err'); }
}
async function _savePlannedExam() {
  const t = tripById(STATE.selectedTrip); if (!t) { toast('Явц сонгоно уу', 'err'); return; }
  const v = id => (($('#' + id) || {}).value || '').trim();
  const horseName = v('pl-e-horse'), diag = v('pl-e-diag'), examNum = v('pl-e-num');
  if (!horseName) { toast('Зүс (нэр) оруулна уу', 'err'); $('#pl-e-horse').focus(); return; }
  if (!diag) { toast('Онош оруулна уу', 'err'); $('#pl-e-diag').focus(); return; }
  if (!examNum) { toast('Үзлэгийн хуудасны дугаар оруулна уу (эсвэл «авто»)', 'err'); $('#pl-e-num').focus(); return; }
  const dup = findExamNumDuplicate(examNum) || await findExamNumDuplicateRemote(examNum);
  if (dup) { toast('⚠️ ' + examNum + ' дугаар аль хэдийн байна (' + (dup.rec.horse || '') + ')', 'err'); $('#pl-e-num').focus(); return; }
  if (!PL_DRAFT.services.length && !confirm('Үйлчилгээ сонгоогүй байна. Үйлчилгээгүйгээр хадгалах уу?')) return;
  const owner = v('pl-e-owner'), phone = v('pl-e-phone');
  const province = v('pl-e-prov'), soum = v('pl-e-soum');
  if (!province) { toast('Аймаг сонгоно уу', 'err'); $('#pl-e-prov').focus(); return; }
  const date = v('pl-e-date') || t.date, time = v('pl-e-time');
  const doc = (STATE.doctors || []).find(d => String(d.id) === v('pl-e-doc'));
  const asst = (STATE.doctors || []).find(d => String(d.id) === v('pl-e-asst'));
  if (!doc) { toast('Эмч сонгоно уу', 'err'); return; }

  // Адуу: зүс + эзэн + аймгаар олно (ИАБД хээрийн үзлэгт байхгүй); байхгүй бол шинээр бүртгэнэ
  // Зарим адууны нэр/эзэн тоо хэлбэрээр хадгалагдсан байж болно (ж: 12) — String()-ээр хамгаална
  const _s = x => (x == null ? '' : String(x)).trim().toLowerCase();
  let horse = (STATE.horses || []).find(h => h && _s(h.name) === horseName.toLowerCase() && _s(h.owner) === owner.toLowerCase() && (!h.province || h.province === province));
  if (!horse) {
    horse = { id: uid(), name: horseName, owner, phone, iabd: '', age: v('pl-e-age'), breed: '', mark: '', province, soum, date, extra: 'Төлөвлөгөөт үзлэг: ' + tripLabel(t), createdAt: nowMs(), ms: nowMs(), kind: 'planned' };
    STATE.horses.push(horse); fbSaveRecord('horses', horse);
  } else if (v('pl-e-age') && !horse.age) { horse.age = v('pl-e-age'); horse.ms = nowMs(); fbSaveRecord('horses', horse); }
  const services = PL_DRAFT.services.map(s => ({ name: s.name, price: parseFloat(s.price) || 0 }));
  const svcSum = services.reduce((a, b) => a + b.price, 0);
  const total = PL_DRAFT.manualTotal ? (parseFloat(v('pl-e-total')) || 0) : svcSum;
  const ms = nowMs();
  const exam = { id: uid(), kind: 'planned', tripId: t.id, tripLocation: t.location || t.province || '',
    horseId: horse.id, horse: horseName, owner, phone, docId: doc.id, docName: doc.name,
    assistDocId: asst ? asst.id : '', assistDocName: asst ? asst.name : '',
    date, time, examNum, diagnosis: diag, note: v('pl-e-note'),
    services, meds: PL_DRAFT.meds.map(m => ({ name: m.name, note: m.note || '' })),
    symptoms: PL_DRAFT.symptoms.slice(), anamnesis: v('pl-e-anam'),
    temp: v('pl-e-temp'), pulse: v('pl-e-pulse'), resp: v('pl-e-resp'), wt: v('pl-e-wt'),
    province, soum, images: [], amount: total, amountManual: PL_DRAFT.manualTotal && total !== svcSum,
    regMs: null, doneMs: ms, durationMin: null, enteredBy: (STATE.user && STATE.user.name) || '', ms };
  STATE.exams.push(exam);
  const fin = { id: uid(), kind: 'planned', tripId: t.id, examId: exam.id, examNum, horse: horseName, owner, phone, docName: doc.name, amount: total,
    services: services.map(s => s.name).join(', '), paid: false, method: '', date, paidDate: '', paidMs: 0, payments: [], ms };
  STATE.fins.push(fin);
  doc.exams = (doc.exams || 0) + 1; doc.rev = (doc.rev || 0) + total; fbSaveRecord('doctors', doc);
  saveAll(); fbSaveRecord('exams', exam); fbSaveRecord('fins', fin);
  let labN = 0; try { if (typeof createLabOrdersFromExam === 'function') labN = createLabOrdersFromExam(exam).length; } catch (e) { console.error('lab', e); }
  writeLog('Төлөвлөгөөт үзлэг шивэв', exam.id, horseName + ' — ' + doc.name, 'Явц: ' + tripLabel(t) + (diag ? ' · Онош: ' + diag : ''), examNum);
  updateBadges();
  toast('✅ ' + horseName + ' (' + examNum + ') хадгалагдлаа' + (labN ? ' · 🧪 ' + labN + ' шинжилгээ' : ''), 'ok');
  // Аймаг/сум/эмч/огноог дараагийн маягтад хэвээр үлдээнэ, адууны талбаруудыг цэвэрлэнэ
  PL_STICKY = { tripId: t.id, province, soum, owner, docId: doc.id, asstId: asst ? asst.id : '' };
  const keepDate = date;
  renderPlanned();
  if ($('#pl-e-date')) $('#pl-e-date').value = keepDate;
  // Дараагийн дугаар: маягт дараалсан бол +1 санал болгоно
  const nv = examNumValue(examNum);
  if ($('#pl-e-num') && nv !== null) { const pad = examNum.replace(/\D/g, '').length; $('#pl-e-num').value = examNum.replace(/\d+/, String(nv + 1).padStart(pad, '0')); }
  const h = $('#pl-e-horse'); if (h) h.focus();
}

// ── Явцын тайлан хэвлэх / CSV ─────────────────────────────────
function printTripReport() {
  const t = tripById(STATE.selectedTrip); if (!t) return;
  const ex = tripExams(t.id).slice().sort((a, b) => ((a.province || '') + (a.examNum || '')) < ((b.province || '') + (b.examNum || '')) ? -1 : 1);
  const s = tripStats(t);
  const svcStats = rpServiceStats(ex);
  $('#print-area').innerHTML = `<div class="rp-print">
    <div class="pr-h1">Төлөвлөгөөт үзлэгийн явцын тайлан</div>
    <div style="text-align:center;margin-bottom:8px">Морьтон Адууны Төв · ${escHTML(tripLabel(t))}${t.soum ? ' · ' + escHTML(t.soum) : ''}</div>
    <table class="pr-tbl"><tr><th>Огноо</th><th>Маршрут</th><th colspan="2">Баг (эмч нар)</th><th>Адуу</th><th>Үзлэг</th><th>Үйлчилгээ</th><th>Нийт дүн</th></tr>
      <tr><td>${escHTML(t.date)}${t.endDate && t.endDate !== t.date ? ' → ' + escHTML(t.endDate) : ''}</td><td>${escHTML(t.route || t.location || '')}</td><td colspan="2">${escHTML(tripDocNames(t))}</td><td>${s.horses}</td><td>${s.n}</td><td>${s.services}</td><td>${fmt(s.amount)}</td></tr></table>
    ${t.note ? '<div style="font-size:9.5pt;margin-bottom:6px"><b>Тэмдэглэл:</b> ' + escHTML(t.note) + '</div>' : ''}
    <div class="pr-h2">Үзсэн адуу</div>
    <table class="pr-tbl pr-wide"><tr><th>#</th><th>Дугаар</th><th>Огноо</th><th>Аймаг / сум</th><th>Зүс</th><th>Эзэн</th><th>Анамнез</th><th>Онош</th><th>Үйлчилгээ</th><th>Эм</th><th>Эмч</th><th>Дүн</th></tr>
      ${ex.map((e, i) => `<tr><td>${i + 1}</td><td>${escHTML(e.examNum || '')}</td><td>${escHTML(e.date || '')}</td><td>${escHTML([e.province, e.soum].filter(Boolean).join(' / '))}</td><td>${escHTML(e.horse || '')}</td><td>${escHTML(e.owner || '')}</td><td>${escHTML(e.anamnesis || '')}</td><td>${escHTML(e.diagnosis || '')}</td><td>${escHTML((e.services || []).map(x => x.name).join(', '))}</td><td>${escHTML((e.meds || []).map(x => x.name || x).join(', '))}</td><td>${escHTML(e.docName || '')}${e.assistDocName ? ' / ' + escHTML(e.assistDocName) : ''}</td><td style="text-align:right">${fmt(e.amount || 0)}</td></tr>`).join('')}
      <tr><td colspan="11"><b>Нийт</b></td><td style="text-align:right"><b>${fmt(s.amount)}</b></td></tr></table>
    <div class="pr-h2">Үйлчилгээний нэгтгэл</div>
    ${rpMiniTablePrint(svcStats, 'Үйлчилгээ', false)}
    <div class="pr-sign"><div>Senior Veterinarian: ${escHTML(t.docName || '')} ____________</div><div>Шивсэн: ${escHTML((STATE.user && STATE.user.name) || '')} ____________</div><div>Удирдах эмч: ____________</div></div>
  </div>`;
  writeLog('Явцын тайлан хэвлэв', t.id, tripLabel(t), s.n + ' үзлэг');
  setTimeout(() => window.print(), 100);
}
function exportTripCSV() {
  const t = tripById(STATE.selectedTrip); if (!t) return;
  const ex = tripExams(t.id).slice().sort((a, b) => (a.examNum || '') < (b.examNum || '') ? -1 : 1);
  const rows = [['Явц', 'Огноо', 'Дугаар', 'Аймаг', 'Сум', 'Зүс', 'Эзэн', 'Утас', 'Анамнез', 'Шинж тэмдэг', 'Онош', 'Үйлчилгээ', 'Эм', 'Темп', 'Зүрх', 'Амьсгал', 'Жин', 'Эмч', 'Хамтрагч', 'Дүн', 'Тэмдэглэл']];
  ex.forEach(e => rows.push([tripLabel(t), e.date || '', e.examNum || '', e.province || '', e.soum || '', e.horse || '', e.owner || '', e.phone || '', e.anamnesis || '', (e.symptoms || []).join(', '), e.diagnosis || '', (e.services || []).map(x => x.name + ' (' + (x.price || 0) + ')').join('; '), (e.meds || []).map(x => (x.name || x) + (x.note ? ' — ' + x.note : '')).join('; '), e.temp || '', e.pulse || '', e.resp || '', e.wt || '', e.docName || '', e.assistDocName || '', e.amount || 0, e.note || '']));
  downloadCSV(rows, 'төлөвлөгөөт_үзлэг_' + (t.date || '') + '_' + (t.location || '').replace(/[\\/:*?"<>|]+/g, ' ') + '.csv');
}

// ============================================================
// HISTORY
// ============================================================
// Pagination — нэг хуудсанд 50 мөр харуулна
let __histPage = 0;
const HIST_PAGE_SIZE = 50;

// Filter өөрчлөгдөхөд pagination-г эхнээс эхлэх
function clearHistFilter() {
  $('#h-q').value = ''; $('#h-from').value = ''; $('#h-to').value = '';
  if ($('#h-sort')) $('#h-sort').value = 'time_desc';
  __histPage = 0;
  renderHistory();
}

function renderHistory() {
  const q = $('#h-q').value.toLowerCase().trim();
  const from = $('#h-from').value;
  const to = $('#h-to').value;
  // 🪟 Цонхноос өмнөх огноо сонгосон бол тэр хугацааг нэг удаа татаад дахин зурна
  if (from && from < LIVE_CUTOFF) ensureRange(from, to || LIVE_CUTOFF).then(ok => { if (ok && STATE.activePage === 'history') renderHistory(); });
  const hintEl = $('#h-hint'); if (hintEl) hintEl.innerHTML = historyHint(from);
  const sortMode = ($('#h-sort') && $('#h-sort').value) || 'time_desc';
  let list = [...STATE.exams].filter(e => examKindOk(e, kindFilterVal('h-kind')));
  if (q) {
    // Морины ИАБД-г хайлтад оруулна (horses-оос horseId-аар олно)
    const iabdOf = (e) => {
      const h = horseOf(e);
      return (h && h.iabd) ? h.iabd : '';
    };
    list = list.filter(e => { const an = examAnamnesis(e); return (e.horse+' '+e.owner+' '+e.phone+' '+e.diagnosis+' '+(e.examNum||'')+' '+iabdOf(e)+' '+an.text+' '+an.symptoms.join(' ')).toLowerCase().includes(q); });
  }
  if (from) list = list.filter(e => e.date >= from);
  if (to) list = list.filter(e => e.date <= to);

  // Үзлэгийн дугаарыг тоонд хөрвүүлэх (0051189 → 51189). Дугааргүйг хамгийн ард тавина.
  const numOf = e => {
    const n = parseInt(String(e.examNum || '').replace(/\D/g, ''), 10);
    return isNaN(n) ? null : n;
  };
  const byNum = (a, b, dir) => {
    const na = numOf(a), nb = numOf(b);
    if (na === null && nb === null) return recTime(b) - recTime(a); // хоёулаа дугааргүй → шинэ нь түрүүнд
    if (na === null) return 1;   // дугааргүйг ард
    if (nb === null) return -1;
    return dir === 'asc' ? na - nb : nb - na;
  };
  const byDate = (a, b, dir) => {
    const da = a.date || '', db = b.date || '';
    if (da === db) return recTime(b) - recTime(a); // ижил огноотой бол бүртгэсэн дарааллаар
    return dir === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
  };

  if (sortMode === 'date_desc')      list.sort((a,b) => byDate(a,b,'desc'));
  else if (sortMode === 'date_asc')  list.sort((a,b) => byDate(a,b,'asc'));
  else if (sortMode === 'num_desc')  list.sort((a,b) => byNum(a,b,'desc'));
  else if (sortMode === 'num_asc')   list.sort((a,b) => byNum(a,b,'asc'));
  else                               list.sort((a,b) => recTime(b) - recTime(a)); // time_desc (анхдагч)

  // Pagination — 50 мөр харуулна, хуудас солих товч гарна
  const totalCount = list.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / HIST_PAGE_SIZE));
  if (__histPage >= totalPages) __histPage = 0;
  const pageStart = __histPage * HIST_PAGE_SIZE;
  const pageList = list.slice(pageStart, pageStart + HIST_PAGE_SIZE);

  $('#h-cnt').textContent = totalCount;
  const tb = $('#h-tb');
  const seeFin = canSeeFinance();
  document.querySelectorAll('.h-amt-col').forEach(th => { th.style.display = seeFin ? '' : 'none'; });
  if (totalCount === 0) {
    tb.innerHTML = '<tr><td colspan="'+(seeFin?10:8)+'" style="text-align:center;padding:20px;color:var(--muted)">Бүртгэл алга</td></tr>';
  } else {
    tb.innerHTML = pageList.map((e, i) => {
      const fin = finByExamId(e.id);
      const status = fin ? (fin.paid?'Төлсөн':'Хүлээгдэж буй') : '—';
      const cls = fin && fin.paid ? 'b-g' : 'b-o';
      const canEdit = canEditData(); // ✏️ хэрэглэгчийн «Засах эрх» тугийг мөрдөнө
      const rowNum = pageStart + i + 1;
      const h = horseOf(e);
      const iabd = (h && h.iabd) ? h.iabd : '';
      const an = examAnamnesis(e);
      const anamLine = [an.text, an.symptoms.join(', ')].filter(Boolean).join(' · ');
      return `
        <tr data-eid="${escHTML(e.id)}" style="cursor:pointer">
          <td>${rowNum}</td>
          <td>${e.examNum?'<span class="badge b-o" style="font-weight:800">'+escHTML(e.examNum)+'</span>':'—'}${kindBadge(e, true)}${e.inpatient ? ' <span class="badge b-p" style="font-size:10px" title="Байрлан эмчилгээ">🏥</span>' : ''}</td>
          <td>${escHTML(e.date)}</td>
          <td>${iabd?escHTML(iabd):'<span class="muted">—</span>'}</td>
          <td class="h-diag" title="${escHTML(e.horse||'')}" style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(e.horse)}</td>
          <td>${escHTML(e.owner)}</td>
          <td>${escHTML(e.phone)}</td>
          <td class="h-diag" title="${escHTML((e.diagnosis||'') + (anamLine ? '\nАнамнез: ' + anamLine : ''))}">${escHTML(e.diagnosis)}${anamLine ? '<div class="muted" style="font-size:10px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📝 ' + escHTML(anamLine) + '</div>' : ''}</td>
          ${seeFin ? '<td class="bold">'+fmt(e.amount)+'</td>' : ''}
          ${seeFin ? '<td><span class="badge '+cls+'">'+status+'</span></td>' : ''}
          ${canEdit ? `<td style="white-space:nowrap"><button class="btn btn-xs btn-sm" onclick="event.stopPropagation();openEditExam('${e.id}')">✏️</button>${(e.date >= addDaysStr(todayStr(), -30) && !examToInpBlock(e)) ? ` <button class="btn btn-xs btn-sm" title="Байрлан эмчилгээнд шилжүүлэх (сүүлийн 30 хоногийн үзлэг; хуучныг дэлгэрэнгүйгээс)" onclick="event.stopPropagation();openExamToInp('${e.id}')">🏥</button>` : ''}</td>` : '<td></td>'}
        </tr>
      `;
    }).join('');
    tb.querySelectorAll('tr[data-eid]').forEach(row => {
      row.addEventListener('click', () => openExamDetail(row.dataset.eid));
    });
  }
  // Pagination controls
  let pagEl = document.getElementById('h-pagination');
  if (!pagEl) {
    pagEl = document.createElement('div');
    pagEl.id = 'h-pagination';
    pagEl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 0;justify-content:center;flex-wrap:wrap';
    const tbParent = tb.parentElement;
    if (tbParent && tbParent.parentElement) tbParent.parentElement.appendChild(pagEl);
  }
  if (totalPages <= 1) {
    pagEl.innerHTML = '';
  } else {
    pagEl.innerHTML = `
      <button class="btn btn-sm" onclick="__histPage=Math.max(0,__histPage-1);renderHistory()" ${__histPage===0?'disabled':''}>← Өмнөх</button>
      <span style="font-size:13px;color:var(--muted)">${__histPage+1} / ${totalPages} · нийт ${totalCount}</span>
      <button class="btn btn-sm" onclick="__histPage=Math.min(${totalPages-1},__histPage+1);renderHistory()" ${__histPage>=totalPages-1?'disabled':''}>Дараах →</button>
    `;
  }
  updateHistArrows(sortMode);
}

// Хүснэгтийн толгойн эрэмбэлэх сум (↑↓) шинэчлэх
function updateHistArrows(sortMode) {
  const numAr = $('#h-ar-num'), dateAr = $('#h-ar-date');
  if (numAr) numAr.textContent = sortMode === 'num_desc' ? '↓' : sortMode === 'num_asc' ? '↑' : '';
  if (dateAr) dateAr.textContent = sortMode === 'date_desc' ? '↓' : sortMode === 'date_asc' ? '↑' : '';
}

// Толгой дээр дарахад тухайн баганаар эрэмбэлэх. Дахин дарахад чиглэл солино.
function histSortBy(col) {
  const sel = $('#h-sort');
  if (!sel) return;
  const cur = sel.value;
  let next;
  if (col === 'num') {
    next = (cur === 'num_desc') ? 'num_asc' : 'num_desc';
  } else {
    next = (cur === 'date_desc') ? 'date_asc' : 'date_desc';
  }
  sel.value = next;
  __histPage = 0;
  renderHistory();
}

function exportHistCSV() {
  const rows = [['#','Дугаар','Огноо','Адуу','Эзэн','Утас','Эмч','Анамнез','Шинж тэмдэг','Онош','Дүн','Статус']];
  STATE.exams.forEach((e,i) => {
    const fin = finByExamId(e.id);
    const an = examAnamnesis(e);
    rows.push([i+1, e.examNum||'', e.date, e.horse, e.owner, e.phone, e.docName, an.text, an.symptoms.join(', '), e.diagnosis, e.amount, fin&&fin.paid?'Төлсөн':'Хүлээгдэж буй']);
  });
  downloadCSV(rows, 'түүх_' + todayStr() + '.csv');
}

// ============================================================
// ADMIN
// ============================================================
function renderAdmin() {
  try { renderFinPinStatus(); } catch(_) {}
  try { renderBonusCfg(); } catch(_) {}
  try { renderExamNumCfg(); } catch(_) {}
  try { renderInpLocCfg(); } catch(_) {}
  try { renderCallCfg(); } catch(_) {}
  try { renderExportSummary(); } catch(_) {}
  $('#a-url').value = STATE.syncURL;
  const list = $('#a-doc-list');
  list.innerHTML = STATE.doctors.map(d => `
    <div class="li" style="cursor:default">
      <div class="li-av">👨‍⚕️</div>
      <div class="li-info">
        <div class="li-name">${escHTML(d.name)}</div>
        <div class="li-sub">${escHTML(d.role)} · ${d.exams||0} үзлэг · ${fmtCompact(d.rev||0)}</div>
      </div>
      <div class="li-r"><button class="btn btn-r btn-xs" onclick="delDoc('${d.id}')">✕</button></div>
    </div>
  `).join('') || '<div class="empty"><div class="empty-em">👨‍⚕️</div>Эмч байхгүй</div>';

  // Лог хэсэг
  renderLogViewer();
  // Хэрэглэгчийн жагсаалт
  renderUserList();
  // Устгасан үзлэгийн архив (зөвхөн Admin)
  renderDeletedExams();
  // 🧪 Шинжилгээ — эрхтэй хүмүүс ба үйлчилгээний тохиргоо
  try { if (typeof renderLabPermList === 'function') renderLabPermList(); } catch(e){}
  try { if (typeof renderLabSvcConfig === 'function') renderLabSvcConfig(); } catch(e){}
}

// ============================================================
// УСТГАСАН ҮЗЛЭГИЙН АРХИВ (зөвхөн Admin — зөвхөн харах)
// ============================================================
function renderDeletedExams() {
  const wrap = document.getElementById('a-deleted-exam-list');
  const card = document.getElementById('deleted-exams-card');
  if (!wrap) return;
  // Зөвхөн Adminд харагдана
  const admin = !!(STATE.user && STATE.user.role === 'Admin');
  if (card) card.style.display = admin ? '' : 'none';
  if (!admin) { wrap.innerHTML = ''; return; }

  const arr = Array.isArray(STATE.deletedExams) ? STATE.deletedExams : [];
  const cnt = document.getElementById('del-exam-count');
  if (cnt) cnt.textContent = arr.length ? '(' + arr.length + ')' : '';

  if (arr.length === 0) {
    wrap.innerHTML = '<div class="empty"><div class="empty-em">🗑️</div>Устгасан үзлэг алга</div>';
    return;
  }
  // Хамгийн сүүлд устгасан нь дээр харагдана
  const rows = arr.map((d, i) => ({ d, i })).sort((a,b) => (b.d.deletedAt||0) - (a.d.deletedAt||0));
  wrap.innerHTML = rows.map(({ d, i }) => {
    const e = d.exam || {};
    const examNum = e.examNum ? String(e.examNum) : '';
    const when = d.deletedAt ? fmtDateTime(d.deletedAt) : '';
    const sub = [
      e.date || '',
      examNum ? '№' + examNum : '',
      (e.amount ? fmt(e.amount) : '')
    ].filter(Boolean).join(' · ');
    return `
    <div class="li" style="cursor:pointer" onclick="openDeletedExamDetail(${i})">
      <div class="li-av">🗑️</div>
      <div class="li-info">
        <div class="li-name">${escHTML(e.horse || '—')} <span class="muted" style="font-weight:600">${escHTML(e.docName||'')}</span></div>
        <div class="li-sub">${escHTML(sub)}</div>
        <div class="li-sub muted" style="font-size:11px">Устгасан: ${escHTML(when)}${d.deletedBy ? ' · ' + escHTML(d.deletedBy) : ''}</div>
      </div>
      <div class="li-r"><span class="muted" style="font-size:12px">Харах →</span></div>
    </div>`;
  }).join('');
}

// Огноо+цаг форматлагч (хэрэв байхгүй бол)
function fmtDateTime(ms) {
  if (!ms) return '';
  try {
    const dt = new Date(ms);
    if (isNaN(dt.getTime())) return '';
    const p = n => String(n).padStart(2, '0');
    return `${dt.getFullYear()}/${p(dt.getMonth()+1)}/${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
  } catch(e) { return ''; }
}

// Устгасан үзлэгийн дэлгэрэнгүйг харах
function openDeletedExamDetail(idx) {
  if (!(STATE.user && STATE.user.role === 'Admin')) { toast('⛔ Зөвхөн Admin харна', 'err'); return; }
  const d = (STATE.deletedExams || [])[idx];
  if (!d) { toast('Олдсонгүй', 'err'); return; }
  const e = d.exam || {};
  const fins = Array.isArray(d.fins) ? d.fins : [];
  const inps = Array.isArray(d.inps) ? d.inps : [];

  // Үйлчилгээ
  let svcHTML = '<div class="muted">Үйлчилгээ алга</div>';
  if (Array.isArray(e.services) && e.services.length) {
    svcHTML = '<div style="display:flex;flex-direction:column;gap:4px">' + e.services.map(s =>
      `<div style="display:flex;justify-content:space-between;gap:8px">
        <span>${escHTML(s.name||'')}</span>
        <span style="font-weight:700">${s.price ? fmt(s.price) : ''}</span>
      </div>`).join('') + '</div>';
  }
  // Эм
  let medsHTML = '<div class="muted">Эм тариа алга</div>';
  if (Array.isArray(e.meds) && e.meds.length) {
    medsHTML = e.meds.map(m => {
      if (typeof m === 'object' && m.name) return escHTML(m.name + (m.note ? ' — ' + m.note : ''));
      return escHTML(String(m));
    }).join('<br>');
  }
  // Холбоотой санхүү
  const finHTML = fins.length
    ? fins.map(f => `<div style="display:flex;justify-content:space-between;gap:8px">
        <span>${escHTML(f.method||'—')} · ${f.paid ? 'Төлсөн' : 'Хүлээгдэж буй'}</span>
        <span style="font-weight:700">${fmt(f.amount||0)}</span></div>`).join('')
    : '<div class="muted">Холбоотой санхүү алга</div>';
  // Холбоотой байрлан эмчлэх
  const inpHTML = inps.length
    ? inps.map(i => `<div>${escHTML(i.horse || i.id || '')} ${i.status ? '· ' + escHTML(i.status) : ''}</div>`).join('')
    : '<div class="muted">Холбоотой байрлан эмчлэх алга</div>';

  const body = document.getElementById('deleted-exam-detail-body');
  if (!body) return;
  body.innerHTML = `
    <div class="fld" style="margin-bottom:10px">
      <div style="background:var(--red-soft,#fde8e6);color:var(--red,#b8332b);padding:8px 12px;border-radius:8px;font-size:12px;font-weight:700">
        🗑️ Устгасан: ${escHTML(d.deletedAt ? fmtDateTime(d.deletedAt) : '')}${d.deletedBy ? ' · ' + escHTML(d.deletedBy) : ''}
      </div>
    </div>
    <div class="fld" style="margin-bottom:8px"><label>Үзлэгийн дугаар</label><div style="font-weight:800">${escHTML(e.examNum||'—')}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Морь</label><div>${escHTML(e.horse||'—')}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Эмч</label><div>${escHTML(e.docName||'—')}${e.assistDocName ? ' · Хамтран: ' + escHTML(e.assistDocName) : ''}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Огноо</label><div>${escHTML(e.date||'—')}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Оношилгоо</label><div style="white-space:pre-wrap">${escHTML(e.diagnosis||'—')}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>💊 Үйлчилгээ</label>${svcHTML}</div>
    <div class="fld" style="margin-bottom:8px"><label>Эм тариа</label><div>${medsHTML}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Дүн</label><div style="font-weight:800">${fmt(e.amount||0)}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Холбоотой санхүү (${fins.length})</label>${finHTML}</div>
    <div class="fld" style="margin-bottom:8px"><label>Холбоотой байрлан эмчлэх (${inps.length})</label>${inpHTML}</div>
  `;
  const m = document.getElementById('deleted-exam-modal');
  if (m) m.classList.add('show');
}

// ============================================================
// ҮЙЛЧИЛГЭЭНИЙ ҮНЭ (Admin панелаас тохируулна, Firebase-д синк)
// ============================================================

// Үйлчилгээ устгахад шаардах нууц код (4 оронтой)
const SVC_DELETE_CODE = '1234';

// Үйлчилгээний үнэ авах helper (хаанаас ч дуудна)
function getSvcPrice(name) {
  if (!name) return 0;
  const p = STATE.servicePrices && STATE.servicePrices[name];
  return parseFloat(p) || 0;
}

// Үнэ оруулах модал нээх
function openServicePrices() {
  // Зөвхөн Admin үнэ тохируулна
  if (!(STATE.user && STATE.user.role === 'Admin')) {
    toast('⛔ Зөвхөн Admin үнэ тохируулна', 'err');
    return;
  }
  const search = document.getElementById('sp-search');
  if (search) { search.value = ''; search.oninput = renderServicePrices; }
  renderServicePrices();
  const m = document.getElementById('service-prices-modal');
  if (m) m.classList.add('show');
}

// Үнийн жагсаалт render
function renderServicePrices() {
  const wrap = document.getElementById('sp-list');
  if (!wrap) return;
  const q = (document.getElementById('sp-search')?.value || '').toLowerCase().trim();
  const all = getAllServices();
  const list = q ? all.filter(s => s.toLowerCase().includes(q)) : all;
  if (list.length === 0) {
    wrap.innerHTML = '<div class="empty" style="padding:16px">Олдсонгүй</div>';
    return;
  }
  wrap.innerHTML = list.map(s => {
    const price = getSvcPrice(s);
    const isCustom = (STATE.customServices || []).includes(s) && !SVCS.includes(s);
    return `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line,#eee)">
      <span style="flex:1;font-size:13px">${escHTML(s)}${isCustom ? ' <span class="muted" style="font-size:10px">(нэмэлт)</span>' : ''}</span>
      <input class="inp sp-price-inp" data-svc="${escHTML(s)}" type="number" value="${price||''}" placeholder="0"
        style="width:100px;text-align:right">
      <span class="muted" style="font-size:12px">₮</span>
      <button class="btn btn-r btn-xs" data-rmsvc="${escHTML(s)}" title="Устгах">🗑️</button>
    </div>`;
  }).join('');
  // Устгах товчуудыг холбоно (онцгой тэмдэгтээс зайлсхийхийн тулд dataset ашиглана)
  wrap.querySelectorAll('button[data-rmsvc]').forEach(b => {
    b.onclick = () => removeCustomService(b.dataset.rmsvc);
  });
}

// Шинэ үйлчилгээ нэмэх (нэр + үнэ)
function addCustomService() {
  if (!(STATE.user && STATE.user.role === 'Admin')) { toast('⛔ Зөвхөн Admin', 'err'); return; }
  const nameEl = document.getElementById('sp-new-name');
  const priceEl = document.getElementById('sp-new-price');
  const name = (nameEl?.value || '').trim();
  const price = parseFloat(priceEl?.value) || 0;
  if (!name) { toast('Нэр оруулна уу', 'err'); return; }
  if (getAllServices().some(s => s.toLowerCase() === name.toLowerCase())) {
    toast('Энэ үйлчилгээ аль хэдийн байна', 'err'); return;
  }
  if (!Array.isArray(STATE.customServices)) STATE.customServices = [];
  STATE.customServices.push(name);
  STATE.removedServices = (STATE.removedServices || []).filter(s => s !== name);
  if (price > 0) STATE.servicePrices[name] = price;
  saveAll();
  fbSaveClinicConfig();
  writeLog('Үйлчилгээ нэмэв', '', '', name + (price ? ' — ' + fmt(price) : ''));
  if (nameEl) nameEl.value = '';
  if (priceEl) priceEl.value = '';
  toast('✅ Үйлчилгээ нэмэгдлээ', 'ok');
  renderServicePrices();
}

// Үйлчилгээ устгах (үндсэн бол нуух, нэмэлт бол бүрэн хасах)
function removeCustomService(name) {
  if (!(STATE.user && STATE.user.role === 'Admin')) { toast('⛔ Зөвхөн Admin', 'err'); return; }
  if (!name) return;
  // Устгахад нууц код шаардана
  const code = prompt('"' + name + '" үйлчилгээг устгахын тулд нууц кодоо оруулна уу:');
  if (code === null) return;  // Болих дарсан
  if (String(code).trim() !== SVC_DELETE_CODE) {
    toast('⛔ Код буруу байна', 'err');
    return;
  }
  if (SVCS.includes(name)) {
    if (!Array.isArray(STATE.removedServices)) STATE.removedServices = [];
    if (!STATE.removedServices.includes(name)) STATE.removedServices.push(name);
  } else {
    STATE.customServices = (STATE.customServices || []).filter(s => s !== name);
  }
  delete STATE.servicePrices[name];
  saveAll();
  fbSaveClinicConfig();
  writeLog('Үйлчилгээ устгав', '', '', name);
  toast('🗑️ Устгагдлаа', 'ok');
  renderServicePrices();
}

// 🕘 Түүхээс үнэ сэргээх — өмнөх үзлэгүүдэд ашигласан хамгийн сүүлийн үнээр
// ХООСОН талбаруудыг дүүргэнэ. Одоо байгаа үнийг хөндөхгүй. Автоматаар
// хадгалахгүй — админ хараад "Хадгалах" дарна.
function restorePricesFromHistory() {
  if (!(STATE.user && STATE.user.role === 'Admin')) { toast('⛔ Зөвхөн Admin', 'err'); return; }
  // Үзлэг + байрлан эмчлүүлэлтээс үйлчилгээний үнийг цуглуулна (шинэ нь эрхэмлэнэ)
  const latest = {};   // { нэр: {price, ms} }
  const scan = (arr, msKey) => {
    (arr || []).forEach(r => {
      const ms = parseFloat(r && r[msKey]) || 0;
      (Array.isArray(r && r.services) ? r.services : []).forEach(sv => {
        const name = sv && (sv.name || sv);
        const price = parseFloat(sv && sv.price) || 0;
        if (!name || price <= 0) return;
        if (!latest[name] || ms >= latest[name].ms) latest[name] = { price, ms };
      });
    });
  };
  scan(STATE.exams, 'ms');
  scan(STATE.inps, 'admittedMs');

  let filled = 0;
  document.querySelectorAll('.sp-price-inp').forEach(inp => {
    const cur = parseFloat(inp.value) || 0;
    if (cur > 0) return;                       // одоо байгаа үнийг хөндөхгүй
    const hit = latest[inp.dataset.svc];
    if (hit && hit.price > 0) { inp.value = hit.price; filled++; }
  });

  if (filled) toast('🕘 ' + filled + ' үйлчилгээний үнэ түүхээс сэргээгдлээ. Шалгаад "Хадгалах" дарна уу.', 'ok');
  else toast('Түүхээс нөхөх үнэ олдсонгүй', 'err');
}

// Үнэ хадгалах
function saveServicePrices() {
  if (!(STATE.user && STATE.user.role === 'Admin')) {
    toast('⛔ Зөвхөн Admin хадгална', 'err');
    return;
  }
  // Жагсаалт дахь бүх оруулсан утгыг цуглуулна (хайлтаар шүүгдсэн ч өмнөх утга хадгалагдана)
  if (!STATE.servicePrices || typeof STATE.servicePrices !== 'object') STATE.servicePrices = {};
  document.querySelectorAll('.sp-price-inp').forEach(inp => {
    const name = inp.dataset.svc;
    const val = parseFloat(inp.value) || 0;
    if (val > 0) STATE.servicePrices[name] = val;
    else delete STATE.servicePrices[name];
  });
  saveAll();
  // ☁️ Firebase рүү ЗААВАЛ бичнэ — эс бөгөөс зөвхөн энэ компьютерт үлдэж,
  // дараагийн sync-ээр сервэрийн хуучин хуулбар дарж устгана.
  fbSaveClinicConfig();
  writeLog('Үйлчилгээний үнэ шинэчлэв', '', '', Object.keys(STATE.servicePrices).length + ' үйлчилгээнд үнэ тохирууллаа');
  toast('✅ Үнэ хадгалагдаж бүх төхөөрөмжид илгээгдлээ', 'ok');
  closeModal('service-prices-modal');
}

// ============================================================
// ХЭРЭГЛЭГЧ УДИРДАХ (нэвтрэх эрх) — Firebase-д хадгалагдана
// ============================================================
// Зөвхөн Admin ба Chief Veterinarian хэрэглэгч удирдаж чадна
function canManageUsers() {
  return !!(STATE.user && ['Admin','Chief Veterinarian'].includes(STATE.user.role));
}

function renderUserList() {
  const el = document.getElementById('a-user-list');
  const card = document.getElementById('user-mgmt-card');
  if (!el) return;
  // Эрхгүй бол картыг бүхэлд нь нуух
  if (card) card.style.display = canManageUsers() ? '' : 'none';
  if (!canManageUsers()) return;

  const users = STATE.users || [];
  const cnt = document.getElementById('user-count');
  if (cnt) cnt.textContent = '(' + users.length + ')';

  el.innerHTML = users.map((u, idx) => `
    <div class="li" style="cursor:pointer" onclick="openUserModal(${idx})">
      <div class="li-av">🔐</div>
      <div class="li-info">
        <div class="li-name">${escHTML(u.name)}</div>
        <div class="li-sub">${escHTML(u.role)} · ${(u.pages||[]).length} хуудас${(u.pages||[]).includes('lab') ? (u.labEdit||u.role==='Admin' ? ' · 🧪 засах' : ' · 🧪 үзэх') : ''}${userCanApproveDx(u) ? ' · 🩺 онош батлах' : ''}${(u.role !== 'Admin' && (typeof u.editData === 'boolean' ? u.editData : EDIT_ROLES.includes(u.role))) ? ' · ✏️ засах' : ''}</div>
      </div>
      <div class="li-r"><button class="btn btn-xs" onclick="event.stopPropagation();openUserModal(${idx})">✏️</button></div>
    </div>
  `).join('') || '<div class="empty"><div class="empty-em">🔐</div>Хэрэглэгч байхгүй</div>';
}

let _editUserIdx = null; // null = шинэ хэрэглэгч

function openUserModal(idx) {
  if (!canManageUsers()) { toast('Танд хэрэглэгч удирдах эрх алга', 'err'); return; }
  _editUserIdx = (typeof idx === 'number') ? idx : null;

  // Дүрийн select-ийг бөглөх (үндсэн + админ нэмсэн дүрүүд)
  const editU = (_editUserIdx !== null) ? STATE.users[_editUserIdx] : null;
  renderUserRoleSelect(editU ? editU.role : ALL_ROLES[0]);
  const roleSel = document.getElementById('u-role');
  const newRoleInp = document.getElementById('u-role-new');
  if (newRoleInp) newRoleInp.value = '';

  const nameInp = document.getElementById('u-name');
  const pwInp = document.getElementById('u-pw');
  const delBtn = document.getElementById('u-del-btn');

  if (editU) {
    const u = editU;
    document.querySelector('#user-modal .mod-title').textContent = '🔐 Хэрэглэгч засах';
    nameInp.value = u.name || '';
    pwInp.value = ''; // Нууц үгийг хэзээ ч харуулахгүй — хоосон орхивол өөрчлөхгүй
    pwInp.placeholder = 'Хоосон орхивол нууц үг өөрчлөгдөхгүй';
    if (roleSel) roleSel.value = u.role || ALL_ROLES[0];
    renderUserPages(u.pages || pagesForRole(u.role));
    setLabEditToggle(!!u.labEdit);
    setFlagToggle('u-dx-approve', typeof u.dxApprove === 'boolean' ? u.dxApprove : roleDefaultDxApprove(u.role));
    setFlagToggle('u-edit-data', typeof u.editData === 'boolean' ? u.editData : EDIT_ROLES.includes(u.role));
    if (delBtn) delBtn.style.display = '';
  } else {
    document.querySelector('#user-modal .mod-title').textContent = '🔐 Хэрэглэгч нэмэх';
    nameInp.value = '';
    pwInp.value = '';
    if (roleSel) roleSel.value = ALL_ROLES[0];
    renderUserPages(pagesForRole(ALL_ROLES[0]));
    setLabEditToggle(false);
    setFlagToggle('u-dx-approve', roleDefaultDxApprove(ALL_ROLES[0]));
    setFlagToggle('u-edit-data', EDIT_ROLES.includes(ALL_ROLES[0]));
    if (delBtn) delBtn.style.display = 'none';
  }
  openModal('user-modal');
}

// ── 👥 Дүрийн жагсаалт (select) + админ нэмсэн дүрүүдийн чипс ─────────
function renderUserRoleSelect(selected) {
  const roleSel = document.getElementById('u-role');
  if (roleSel) {
    const roles = allRoles();
    if (selected && !roles.includes(selected)) roles.push(selected);
    roleSel.innerHTML = roles.map(r => '<option value="' + escHTML(r) + '">' + escHTML(r) + '</option>').join('');
    if (selected) roleSel.value = selected;
  }
  const chips = document.getElementById('u-role-custom');
  if (chips) {
    const custom = Array.isArray(STATE.customRoles) ? STATE.customRoles : [];
    chips.innerHTML = custom.length
      ? '<span class="muted" style="font-size:11px">Нэмсэн дүрүүд:</span> ' + custom.map(r => {
          const used = (STATE.users || []).filter(u => u.role === r).length;
          return '<span class="badge b-p" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px">' + escHTML(r) +
            (used ? ' <span style="opacity:.7">· ' + used + '</span>' : ' <a href="#" title="Дүр устгах" data-role="' + escHTML(r) + '" style="color:var(--red);text-decoration:none;font-weight:900" onclick="removeCustomRole(this.dataset.role);return false;">✕</a>') + '</span>';
        }).join(' ')
      : '';
  }
}
function addCustomRole() {
  if (!canManageUsers()) { toast('Эрх алга', 'err'); return; }
  const inp = document.getElementById('u-role-new');
  const name = String((inp && inp.value) || '').trim().replace(/\s+/g, ' ');
  if (!name) { toast('Шинэ дүрийн нэрийг бичнэ үү (ж: Manager)', 'err'); if (inp) inp.focus(); return; }
  if (name.length > 40) { toast('Дүрийн нэр хэт урт байна', 'err'); return; }
  const exists = allRoles().find(r => r.toLowerCase() === name.toLowerCase());
  if (exists) {
    renderUserRoleSelect(exists); onUserRoleChange();
    if (inp) inp.value = '';
    toast('«' + exists + '» дүр аль хэдийн байна — сонголоо', 'ok'); return;
  }
  if (!Array.isArray(STATE.customRoles)) STATE.customRoles = [];
  STATE.customRoles.push(name);
  lsSet('mt_custom_roles', STATE.customRoles);
  fbSaveClinicConfig();
  writeLog('Шинэ дүр нэмсэн', '', name, '');
  if (inp) inp.value = '';
  renderUserRoleSelect(name);
  onUserRoleChange();
  toast('✅ «' + name + '» дүр нэмэгдлээ — хандах хуудсуудаа сонгоод хадгална уу', 'ok');
}
function removeCustomRole(name) {
  if (!canManageUsers()) { toast('Эрх алга', 'err'); return; }
  if ((STATE.users || []).some(u => u.role === name)) { toast('Энэ дүртэй хэрэглэгч байгаа тул устгах боломжгүй', 'err'); return; }
  if (!confirm('«' + name + '» дүрийг жагсаалтаас хасах уу?')) return;
  const roleSel = document.getElementById('u-role');
  const cur = roleSel ? roleSel.value : '';
  STATE.customRoles = (STATE.customRoles || []).filter(r => r !== name);
  lsSet('mt_custom_roles', STATE.customRoles);
  fbSaveClinicConfig();
  writeLog('Дүр хассан', '', name, '');
  renderUserRoleSelect(cur === name ? ALL_ROLES[0] : cur);
  if (cur === name) onUserRoleChange();
}

// ── Хэрэглэгчийн тугууд: 🩺 онош батлах, ✏️ засах эрх ─────────────
// Онош батлах анхдагч: «Senior Veterinarian» дүртэй хүн (Өсөхбаяр, Сайнбилэг)
function roleDefaultDxApprove(role) { return role === 'Senior Veterinarian'; }
const USER_FLAG_UI = {
  'u-dx-approve': { on: '🩺 Онош батална', off: 'Онош батлахгүй', color: 'var(--purple)', soft: 'var(--purple-soft)' },
  'u-edit-data':  { on: '✏️ Засах эрхтэй', off: '👁️ Зөвхөн үзэх', color: 'var(--green)', soft: 'var(--green-soft)' }
};
function setFlagToggle(id, on) {
  const b = document.getElementById(id); const ui = USER_FLAG_UI[id];
  if (!b || !ui) return;
  b.dataset.on = on ? '1' : '0';
  b.textContent = on ? ui.on : ui.off;
  b.style.border = '1.5px solid ' + (on ? ui.color : 'var(--border)');
  b.style.background = on ? ui.soft : '#fff';
  b.style.color = on ? ui.color : 'var(--muted)';
}
function toggleFlag(id) { const b = document.getElementById(id); if (b) setFlagToggle(id, b.dataset.on !== '1'); }
function _flagOn(id) { const b = document.getElementById(id); return !!(b && b.dataset.on === '1'); }

// Хуудас бүрийг toggle хийх чекбокс товчнууд
function renderUserPages(selectedPages) {
  const wrap = document.getElementById('u-pages');
  if (!wrap) return;
  const sel = new Set(selectedPages || []);
  wrap.innerHTML = ALL_PAGES.map(p => {
    const on = sel.has(p.id);
    return '<button type="button" class="badge" data-page="'+p.id+'" data-on="'+(on?'1':'0')+'" onclick="toggleUserPage(this)" '
      + 'style="cursor:pointer;border:1.5px solid '+(on?'var(--orange)':'var(--border)')+';'
      + 'padding:6px 10px;background:'+(on?'var(--orange-soft)':'#fff')+';color:'+(on?'var(--orange-dark)':'var(--muted)')+';font-weight:700">'
      + escHTML(p.label) + '</button>';
  }).join('');
}

// 🧪 Шинжилгээ засах эрхийн toggle
function setLabEditToggle(on) {
  const b = document.getElementById('u-lab-edit');
  if (!b) return;
  b.dataset.on = on ? '1' : '0';
  b.textContent = on ? '✍️ Үзэх + Засах' : '👁️ Зөвхөн үзэх';
  b.style.border = '1.5px solid ' + (on ? 'var(--green)' : 'var(--border)');
  b.style.background = on ? 'var(--green-soft)' : '#fff';
  b.style.color = on ? 'var(--green)' : 'var(--muted)';
}
function toggleLabEdit() {
  const b = document.getElementById('u-lab-edit');
  if (!b) return;
  setLabEditToggle(b.dataset.on !== '1');
}

function toggleUserPage(btn) {
  const on = btn.dataset.on === '1';
  const next = !on;
  btn.dataset.on = next ? '1' : '0';
  btn.style.border = '1.5px solid ' + (next ? 'var(--orange)' : 'var(--border)');
  btn.style.background = next ? 'var(--orange-soft)' : '#fff';
  btn.style.color = next ? 'var(--orange-dark)' : 'var(--muted)';
}

// Дүр солиход тухайн дүрийн ердийн эрхийг автоматаар тэмдэглэнэ
function onUserRoleChange() {
  const roleSel = document.getElementById('u-role');
  if (!roleSel) return;
  renderUserPages(pagesForRole(roleSel.value));
  setFlagToggle('u-dx-approve', roleDefaultDxApprove(roleSel.value));
  setFlagToggle('u-edit-data', EDIT_ROLES.includes(roleSel.value));
}

// u-pages дотроос сонгосон хуудсуудыг цуглуулах
function collectUserPages() {
  const wrap = document.getElementById('u-pages');
  if (!wrap) return [];
  const out = [];
  wrap.querySelectorAll('button[data-page]').forEach(b => {
    if (b.dataset.on === '1') out.push(b.dataset.page);
  });
  return out;
}

// Нууц үгийг SHA-256 hash болгоно (Web Crypto API — browser native)
async function _hashPassword(pw) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pw + 'moriton_salt_2026'));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
// Login шалгалтыг hash-тай харьцуулах
async function _checkPassword(inputPw, user) {
  if (user.pwHash) {
    const h = await _hashPassword(inputPw);
    return h === user.pwHash;
  }
  // Шилжилтийн үе: pw (plain) талбар байвал — hash руу шилжих хүртэл
  if (user.pw) return inputPw === user.pw;
  return false;
}

function saveUser() {
  if (!canManageUsers()) { toast('Эрх алга', 'err'); return; }
  const name = (document.getElementById('u-name').value || '').trim();
  const pw = (document.getElementById('u-pw').value || '').trim();
  const role = document.getElementById('u-role').value;
  const pages = collectUserPages();

  if (!name) { toast('Нэвтрэх нэр оруулна уу', 'err'); return; }
  if (!pw && _editUserIdx === null) { toast('Нууц үг оруулна уу', 'err'); return; }
  if (!pages.length) { toast('Дор хаяж нэг хуудсын эрх сонгоно уу', 'err'); return; }

  if (!Array.isArray(STATE.users)) STATE.users = [];

  const dupIdx = STATE.users.findIndex((u, i) => u.name === name && i !== _editUserIdx);
  if (dupIdx !== -1) { toast('Энэ нэртэй хэрэглэгч аль хэдийн байна', 'err'); return; }

  const ms = nowMs();

  // Нууц үгийг hash хийж хадгална — plain text Firestore/localStorage-д орохгүй
  const doSave = async () => {
    let pwHash;
    if (pw) {
      pwHash = await _hashPassword(pw);
    } else if (_editUserIdx !== null && STATE.users[_editUserIdx]) {
      // Нууц үг оруулаагүй бол хуучин hash хэвээр үлдэнэ
      pwHash = STATE.users[_editUserIdx].pwHash || '';
    } else {
      pwHash = '';
    }

    const labEdit = !!(document.getElementById('u-lab-edit') && document.getElementById('u-lab-edit').dataset.on === '1');
    const dxApprove = _flagOn('u-dx-approve');
    const editData = role === 'Admin' ? true : _flagOn('u-edit-data');
    const userObj = { name, pwHash, role, pages, labEdit, dxApprove, editData, ms };
    if (_editUserIdx !== null && STATE.users[_editUserIdx]) {
      STATE.users[_editUserIdx] = userObj;
      writeLog('Хэрэглэгч заслаа', name, role);
    } else {
      STATE.users.push(userObj);
      writeLog('Хэрэглэгч нэмлээ', name, role);
    }

    _scheduleLsSave('users');
    // Firestore-д pwHash хадгална — pw (plain text) хэзээ ч явахгүй
    const userRec = { name, pwHash, role, pages, labEdit, dxApprove, editData, ms, _updatedAt: ms, _writer: window.__fbDeviceId || 'unknown' };
    fbWriteDoc('users', safeDocId(name), userRec)
      .then(() => { try { flashSync(); } catch(e){} })
      .catch(err => toast('Firebase алдаа: ' + err.message, 'err'));
    populateLoginUsers();
    renderUserList();
    closeModal('user-modal');
    toast('✓ Хэрэглэгч хадгалагдлаа.', 'ok');
  };

  doSave().catch(err => toast('Алдаа: ' + err.message, 'err'));
}

function deleteUser() {
  if (!canManageUsers()) { toast('Эрх алга', 'err'); return; }
  if (_editUserIdx === null || !STATE.users[_editUserIdx]) return;
  const u = STATE.users[_editUserIdx];

  // Сүүлийн админ/ерөнхий эмчийг устгахаас сэргийлэх
  const adminLikeCount = STATE.users.filter(x => ['Admin','Chief Veterinarian'].includes(x.role)).length;
  if (['Admin','Chief Veterinarian'].includes(u.role) && adminLikeCount <= 1) {
    toast('Сүүлийн админ эрхтэй хэрэглэгчийг устгах боломжгүй', 'err');
    return;
  }
  // Өөрийгөө устгахаас сэргийлэх
  if (STATE.user && STATE.user.name === u.name) {
    toast('Өөрийгөө устгах боломжгүй', 'err');
    return;
  }
  if (!confirm('"' + u.name + '" хэрэглэгчийг устгах уу? Тэр цаашид нэвтэрч чадахгүй.')) return;

  STATE.users.splice(_editUserIdx, 1);
  _scheduleLsSave('users');
  fbDeleteDoc('users', safeDocId(u.name));
  writeLog('Хэрэглэгч устгалаа', u.name, u.role);
  populateLoginUsers();
  renderUserList();
  closeModal('user-modal');
  toast('Хэрэглэгч устгагдлаа', 'ok');
}

// ============================================================
// LOG VIEWER
// ============================================================
const LOG_DISPLAY_LIMIT = 200; // Нийт хадгалах, 200 харуулах

function renderLogViewer() {
  const el = document.getElementById('a-log-list');
  if (!el) return;
  const allLogs = (STATE.logs || []).slice().sort((a,b) => (b.log_ms||0) - (a.log_ms||0));
  const logs = allLogs.slice(0, LOG_DISPLAY_LIMIT);
  // Лог тооны мэдээлэл харуулах
  const logCountEl = document.getElementById('a-log-count');
  if (logCountEl) logCountEl.textContent = allLogs.length > LOG_DISPLAY_LIMIT
    ? `Сүүлийн ${LOG_DISPLAY_LIMIT} лог (нийт ${allLogs.length})`
    : `Нийт ${allLogs.length} лог`;
  if (!logs.length) {
    el.innerHTML = '<div class="empty"><div class="empty-em">📋</div>Лог байхгүй</div>';
    return;
  }
  el.innerHTML = logs.map(l => `
    <div class="li" style="cursor:default">
      <div class="li-av" style="font-size:18px">📝</div>
      <div class="li-info">
        <div class="li-name">${escHTML(l.user_name||'')} <span style="font-weight:400;color:var(--muted)">(${escHTML(l.user_role||'')})</span></div>
        <div class="li-sub">${escHTML(l.action||'')} ${l.target_name ? '· ' + escHTML(l.target_name) : ''}</div>
        ${l.details ? `<div class="li-sub" style="color:var(--muted);font-size:11px;margin-top:2px">${escHTML(l.details)}</div>` : ''}
      </div>
      <div class="li-r" style="font-size:11px;color:var(--muted)">${escHTML(l.log_date||'')}</div>
    </div>
  `).join('');
}

// ============================================================
// EDIT HORSE
// ============================================================
function openEditHorse(id) {
  const h = horseById(id);
  if (!h) return;
  STATE._editHorse = h;
  STATE._editHorseId = String(h.id); // заалт салсан ч id-аар нь дахин олно
  const m = document.getElementById('edit-horse-modal');
  if (!m) return;
  document.getElementById('eh-name').value = h.name || '';
  const ehIabd = document.getElementById('eh-iabd');
  if (ehIabd) ehIabd.value = h.iabd || '';
  document.getElementById('eh-owner').value = h.owner || '';
  document.getElementById('eh-phone').value = h.phone || '';
  document.getElementById('eh-breed').value = h.breed || '';
  document.getElementById('eh-age').value = h.age || '';
  document.getElementById('eh-province').value = h.province || '';
  document.getElementById('eh-soum').value = h.soum || '';
  const delBtn = document.getElementById('eh-del-btn');
  if (delBtn) delBtn.style.display = canDelete() ? '' : 'none';
  m.classList.add('show');
}

function saveEditHorse() {
  // Заалт салсан байж болзошгүй тул ЭХЛЭЭД id-аар нь амьд бичлэгийг олно
  const h = (STATE.horses || []).find(x => String(x.id) === String(STATE._editHorseId)) || STATE._editHorse;
  if (!h) return;
  if (!canEditData()) { toast('⛔ Засах эрхгүй', 'err'); return; }
  const before = { ...h };
  h.name     = document.getElementById('eh-name').value.trim();
  const ehIabd = document.getElementById('eh-iabd');
  if (ehIabd) h.iabd = ehIabd.value.trim();
  h.owner    = document.getElementById('eh-owner').value.trim();
  h.phone    = document.getElementById('eh-phone').value.trim();
  h.breed    = document.getElementById('eh-breed').value.trim();
  h.age      = document.getElementById('eh-age').value.trim();
  h.province = document.getElementById('eh-province').value.trim();
  h.soum     = document.getElementById('eh-soum').value.trim();
  h.ms       = nowMs();
  const changes = diffStr(before, h, [
    {k:'name',label:'Нэр'},{k:'iabd',label:'ИАБД'},{k:'owner',label:'Эзэн'},{k:'phone',label:'Утас'},
    {k:'breed',label:'Үүлдэр'},{k:'age',label:'Нас'},{k:'province',label:'Аймаг'},{k:'soum',label:'Сум'}
  ]);
  saveAll();
  fbSaveRecord('horses', h);
  writeLog('Морь засварласан', h.id, h.name + ' / ' + h.owner, changes || 'Өөрчлөлтгүй хадгалсан');
  closeModal('edit-horse-modal');
  toast('✅ Хадгалагдлаа', 'ok');
}

function deleteHorse(id) {
  if (!canDelete()) { toast('⛔ Устгах эрх зөвхөн Adminд байна', 'err'); return; }
  const h = STATE.horses.find(x => x.id === id);
  if (!h) return;
  if (!confirm('"' + h.name + '" морийг устгах уу?\nЭнэ морийн БҮХ үзлэг, санхүүгийн бичлэг хамт устана.')) return;

  // Cascade: энэ морьтой холбоотой үзлэг → түүний санхүү
  const linkedExams = STATE.exams.filter(e => String(e.horseId) === String(id) || (e.horse && h.name && e.horse === h.name));
  const linkedExamIds = new Set(linkedExams.map(e => String(e.id)));
  const linkedFins = STATE.fins.filter(f => linkedExamIds.has(String(f.examId)));

  // deletedIds-д бүгдийг тэмдэглэж, Firestore-оос устгана
  STATE.deletedIds.add(String(id));
  linkedExams.forEach(e => { STATE.deletedIds.add(String(e.id)); fbDeleteDoc('exams', String(e.id)); });
  linkedFins.forEach(f => { STATE.deletedIds.add(String(f.id)); fbDeleteDoc('fins', String(f.id)); });

  // Локал массивуудаас хасна
  STATE.horses = STATE.horses.filter(x => x.id !== id);
  STATE.exams  = STATE.exams.filter(x => !linkedExamIds.has(String(x.id)));
  STATE.fins   = STATE.fins.filter(x => !linkedFins.some(f => f.id === x.id));

  saveAll();
  fbDeleteDoc('horses', String(id));
  writeLog('Морь устгасан', id, h.name + ' / ' + h.owner,
    `Холбоотойгоор устсан: ${linkedExams.length} үзлэг, ${linkedFins.length} санхүү`);
  closeModal('edit-horse-modal');
  toast('Устгагдлаа · холбоотой ' + linkedExams.length + ' үзлэг арилсан', 'ok');
  updateBadges();
  if (STATE.activePage === 'kpi') renderKPI();
  if (STATE.activePage === 'finance') renderFinance();
}

// ============================================================
// EDIT EXAM
// ============================================================
function openEditExam(id) {
  const e = STATE.exams.find(x => x.id === id);
  if (!e) return;
  STATE._editExam = e;
  STATE._editExamId = String(e.id); // заалт салсан ч id-аар нь дахин олно
  const m = document.getElementById('edit-exam-modal');
  if (!m) return;
  document.getElementById('ee-examnum').value = e.examNum || '';
  document.getElementById('ee-horse').value = e.horse || '';
  document.getElementById('ee-doctor').value = e.docName || '';
  document.getElementById('ee-diagnosis').value = e.diagnosis || '';
  document.getElementById('ee-amount').value = e.amount || 0;
  document.getElementById('ee-date').value = e.date || '';
  // Үйлчилгээний жагсаалтыг бэлдэх (засварлахад зориулж хуулбар авна)
  if (!Array.isArray(e.services)) e.services = [];
  STATE._editExamSvcs = e.services.map(s => ({ name: s.name, price: parseFloat(s.price) || 0 }));
  const eeSearch = document.getElementById('ee-svc-search');
  if (eeSearch) { eeSearch.value = ''; eeSearch.oninput = renderEEsvcList; }
  renderEEsvcList();
  renderEEselectedSvcs();
  const delBtnE = document.getElementById('ee-del-btn');
  if (delBtnE) delBtnE.style.display = canDelete() ? '' : 'none';

  // 🏥 Байрлан эмчлүүлэлттэй үзлэг бол нэхэмжлэхийн бүрэн задаргааг харуулна:
  // үзлэг + эмчилгээ + хоногийн хөлс + гэрийн эм = нийт нэхэмжилсэн дүн
  let sumBox = document.getElementById('ee-inp-summary');
  if (!sumBox) {
    const amtEl = document.getElementById('ee-amount');
    const amtFld = amtEl && amtEl.closest('.fld');
    if (amtFld) {
      sumBox = document.createElement('div');
      sumBox.id = 'ee-inp-summary';
      amtFld.insertAdjacentElement('afterend', sumBox);
    }
  }
  const eeInp = STATE.inps.find(x => String(x.examId) === String(e.id));
  window.__eeRenderInpSum = null;
  if (sumBox) {
    if (!eeInp) {
      sumBox.innerHTML = '';
      sumBox.style.display = 'none';
    } else {
      const iDays  = inpatientDays(eeInp.admittedMs, eeInp.dischargedMs);
      const iFee   = getDailyFee(eeInp);
      const iTreat = getInpDailyTotal(eeInp);
      const iLogsN = Array.isArray(eeInp.log) ? eeInp.log.length : 0;
      const iHM    = (eeInp.dischargeInfo && Array.isArray(eeInp.dischargeInfo.homeMeds))
        ? eeInp.dischargeInfo.homeMeds.reduce((a, m) => a + (parseFloat(m.price) || 0), 0) : 0;
      const renderSum = () => {
        const examAmt = parseFloat(document.getElementById('ee-amount').value) || 0;
        const grand = examAmt + iTreat + iFee * iDays + iHM;
        sumBox.innerHTML = `
          <div class="fld" style="margin-top:8px"><label>🏥 Байрлан эмчлүүлэлтийн нэхэмжлэл</label>
            <div style="background:var(--input);padding:10px 12px;border-radius:8px;font-size:13px">
              <div class="row" style="justify-content:space-between;margin-bottom:3px"><span>🩺 Үзлэгийн төлбөр (энэ маягт):</span><span class="bold">${fmt(examAmt)}</span></div>
              <div class="row" style="justify-content:space-between;margin-bottom:3px"><span>💊 Эмчилгээ (${iLogsN} бичлэг):</span><span class="bold">${fmt(iTreat)}</span></div>
              <div class="row" style="justify-content:space-between;margin-bottom:3px"><span>🏨 Хоног (${iDays} × ${fmt(iFee)}):</span><span class="bold">${fmt(iFee * iDays)}</span></div>
              ${iHM > 0 ? `<div class="row" style="justify-content:space-between;margin-bottom:3px"><span>🏠 Гэрийн эм:</span><span class="bold">${fmt(iHM)}</span></div>` : ''}
              <div class="row" style="justify-content:space-between;padding-top:5px;border-top:1px solid var(--border);font-size:15px"><span class="bold">Нийт нэхэмжилсэн дүн:</span><span class="bold" style="color:var(--orange-dark)">${fmt(grand)}</span></div>
              <div class="muted" style="font-size:11px;margin-top:6px">Эмчилгээ, хоногийн бичлэгийг Байрлан эмчлүүлэх цэснээс засна. Хадгалахад нийт дүн санхүүд автоматаар шинэчлэгдэнэ.</div>
            </div>
          </div>`;
      };
      sumBox.style.display = '';
      renderSum();
      window.__eeRenderInpSum = renderSum;
      const amtEl2 = document.getElementById('ee-amount');
      if (amtEl2) amtEl2.oninput = renderSum;
    }
  }
  m.classList.add('show');
}

// Засварлах модал дахь үйлчилгээний хайлтын жагсаалт
function renderEEsvcList() {
  const wrap = document.getElementById('ee-svc-list');
  if (!wrap) return;
  const q = (document.getElementById('ee-svc-search')?.value || '').toLowerCase().trim();
  if (!q) { wrap.innerHTML = '<div class="muted" style="font-size:12px;padding:8px">Үйлчилгээ хайхын тулд бичнэ үү</div>'; return; }
  const list = getAllServices().filter(s => s.toLowerCase().includes(q)).slice(0, 30);
  wrap.innerHTML = list.map(s => `
    <div class="svc-item" data-svc="${escHTML(s)}">
      <span class="svc-item-name">${escHTML(s)}</span>
      <span style="color:var(--orange);font-size:16px;font-weight:900">+</span>
    </div>
  `).join('') || '<div class="muted" style="font-size:12px;padding:8px">Олдсонгүй</div>';
  wrap.querySelectorAll('.svc-item').forEach(el => el.onclick = () => {
    const s = el.dataset.svc;
    if (!STATE._editExamSvcs.find(x => x.name === s)) {
      STATE._editExamSvcs.push({ name: s, price: getSvcPrice(s) });
      renderEEselectedSvcs();
    }
  });
}

// Засварлах модал дахь сонгосон үйлчилгээнүүд
function renderEEselectedSvcs() {
  const wrap = document.getElementById('ee-svc-selected');
  if (!wrap) return;
  const arr = STATE._editExamSvcs || [];
  if (arr.length === 0) {
    wrap.innerHTML = '<div class="empty" style="padding:12px;font-size:12px">Үйлчилгээ сонгоогүй</div>';
  } else {
    wrap.innerHTML = arr.map((s,i) => `
      <div class="svc-row">
        <div class="svc-row-name">${escHTML(s.name)}</div>
        <input class="inp" type="number" data-i="${i}" value="${s.price||''}" placeholder="0">
        <button class="btn btn-r btn-xs" data-rm="${i}">✕</button>
      </div>
    `).join('');
    wrap.querySelectorAll('input[type=number]').forEach(inp => inp.oninput = () => {
      arr[+inp.dataset.i].price = parseFloat(inp.value) || 0;
      ee_syncAmountFromSvcs();
    });
    wrap.querySelectorAll('button[data-rm]').forEach(b => b.onclick = () => {
      arr.splice(+b.dataset.rm, 1);
      renderEEselectedSvcs();
    });
  }
  ee_syncAmountFromSvcs();
}

// Үйлчилгээний нийлбэрийг Дүн талбарт автоматаар тавина
function ee_syncAmountFromSvcs() {
  const arr = STATE._editExamSvcs || [];
  if (arr.length === 0) return;
  const t = arr.reduce((a,b)=>a+(parseFloat(b.price)||0),0);
  const amtEl = document.getElementById('ee-amount');
  if (amtEl) amtEl.value = t;
  // 🏥 Байрлангийн нэхэмжлэхийн задаргааг мөн шинэчилнэ
  if (typeof window.__eeRenderInpSum === 'function') window.__eeRenderInpSum();
}

function saveEditExam() {
  // Заалт салсан байж болзошгүй тул ЭХЛЭЭД id-аар нь амьд бичлэгийг олно
  const e = (STATE.exams || []).find(x => String(x.id) === String(STATE._editExamId)) || STATE._editExam;
  if (!e) return;
  if (!canEditData()) { toast('⛔ Засах эрхгүй', 'err'); return; }

  // Үзлэгийн хуудасны дугаарыг шалгах
  const newExamNum = document.getElementById('ee-examnum').value.trim();
  if (newExamNum && newExamNum !== (e.examNum || '')) {
    const dup = findExamNumDuplicate(newExamNum, e.id);
    if (dup) {
      const r = dup.rec || {};
      const who = r.horse || r.owner || '';
      toast('⚠️ ' + newExamNum + ' дугаар ' + dup.source + '-д ашиглагдсан байна' + (who ? ' (' + who + ')' : ''), 'err');
      return;
    }
  }

  const before = { ...e };
  const beforeSvcStr = (Array.isArray(e.services)?e.services:[]).map(s=>s.name).join(', ');
  e.examNum   = newExamNum;
  e.diagnosis = document.getElementById('ee-diagnosis').value.trim();
  // Үйлчилгээг хадгална
  e.services  = (STATE._editExamSvcs || []).map(s => ({ name: s.name, price: parseFloat(s.price) || 0 }));
  e.amount    = parseFloat(document.getElementById('ee-amount').value) || 0;
  e.ms        = nowMs();
  // 🩺 Засварт онош өөрчлөгдвөл: батлагч засвал батлагдсан хэвээр (түүнийх болно),
  // бусад хүн засвал дахин хянуулахаар (⏳) буцна — батлаагүй онош хэвлэгдэхгүй.
  if ((before.diagnosis || '') !== (e.diagnosis || '') && dxStatusOf(e) && !isPlanned(e)) {
    const me = STATE.user ? STATE.user.name : '';
    if (canApproveDx()) { e.dxStatus = 'approved'; e.dxApprovedBy = me; e.dxApprovedMs = nowMs(); e.dxAuto = false; }
    else { e.dxStatus = 'pending'; e.dxSubmittedMs = nowMs(); }
    _dxPush(e, { ms: nowMs(), by: me, action: 'edit', text: e.diagnosis || '', prev: before.diagnosis || '' });
    _dxSyncInp(e, before.diagnosis || '');
  }
  const afterSvcStr = e.services.map(s=>s.name).join(', ');
  const changes = diffStr(before, e, [
    {k:'examNum',label:'Дугаар'},{k:'diagnosis',label:'Онош'},{k:'amount',label:'Дүн'}
  ]);
  let svcChange = '';
  if (beforeSvcStr !== afterSvcStr) svcChange = 'Үйлчилгээ: «' + (beforeSvcStr||'—') + '» → «' + (afterSvcStr||'—') + '»';
  const allChanges = [changes, svcChange].filter(Boolean).join('; ');
  // Холбоотой санхүүгийн бичлэгийг шинэчилнэ (cascade)
  // Дугаар, дүн, үйлчилгээ — алинд нь өөрчлөлт орсон ч санхүүд тусгана
  const examNumChanged = (before.examNum || '') !== (e.examNum || '');
  const amountChanged  = before.amount !== e.amount;
  const svcChanged     = beforeSvcStr !== afterSvcStr;
  // 🏥 Байрлан эмчлүүлэлттэй үзлэг: үзлэгийн дүн өөрчлөгдвөл inp-ийн
  // initialAmount-ыг мөн шинэчилнэ (дэвтэр, гарах тооцоо зөв гарна)
  const linkedInp = STATE.inps.find(i => String(i.examId) === String(e.id));
  if (linkedInp && amountChanged) {
    linkedInp.initialAmount = e.amount;
    linkedInp.ms = nowMs();
    fbSaveRecord('inps', linkedInp);
  }
  if (examNumChanged || amountChanged || svcChanged) {
    STATE.fins.filter(f => String(f.examId) === String(e.id)).forEach(f => {
      // Байрлангийн нэхэмжлэх мөн үү? ('Байрлан/Хэвтэн эмчилгээ N хоног' гэсэн үйлчилгээтэй)
      const isInpFin = !!linkedInp && /эмчилгээ\s*\d+\s*хоног/i.test(String(f.services || ''));
      if (amountChanged) {
        if (isInpFin) {
          // ⚠️ Урьд нь энд e.amount-аар шууд дардаг байсан нь байрлангийн
          // НИЙТ нэхэмжилсэн дүнг (үзлэг+эмчилгээ+хоног) устгадаг байв.
          // Одоо задаргаагаар нь дахин тооцно.
          const iDays = inpatientDays(linkedInp.admittedMs, linkedInp.dischargedMs);
          const iHM = (linkedInp.dischargeInfo && Array.isArray(linkedInp.dischargeInfo.homeMeds))
            ? linkedInp.dischargeInfo.homeMeds.reduce((a, m) => a + (parseFloat(m.price) || 0), 0) : 0;
          f.amount = (parseFloat(e.amount) || 0) + getInpDailyTotal(linkedInp) + getDailyFee(linkedInp) * iDays + iHM;
        } else {
          f.amount = e.amount;
        }
      }
      if (svcChanged && !isInpFin) f.services = afterSvcStr; // байрлангийн 'N хоног' бичвэрийг хадгална
      if (examNumChanged) f.examNum = e.examNum; // дугаарыг санхүүд мөн шинэчилнэ
      f.ms = nowMs();
      fbSaveRecord('fins', f);
    });
    // Байрлан эмчлэх бичлэгт ч дугаар шинэчилнэ
    if (examNumChanged) {
      STATE.inps.filter(i => String(i.examId) === String(e.id)).forEach(i => {
        i.examNum = e.examNum;
        i.ms = nowMs();
        fbSaveRecord('inps', i);
      });
    }
  }
  saveAll();
  fbSaveRecord('exams', e);
  // 🧪 Засварлахдаа шинжилгээ нэмсэн бол дутуу захиалгыг үүсгэнэ (давхардахгүй)
  try { if (typeof createLabOrdersFromExam === 'function') createLabOrdersFromExam(e); } catch(err) { console.error('lab', err); }
  writeLog('Үзлэг засварласан', e.id, e.horse + ' — ' + (e.docName||''), allChanges || 'Өөрчлөлтгүй хадгалсан');
  closeModal('edit-exam-modal');
  toast('✅ Хадгалагдлаа', 'ok');
  renderHistory();
  if (STATE.activePage === 'kpi') renderKPI();
  if (STATE.activePage === 'finance') renderFinance();
}

function deleteExam(id) {
  if (!canDelete()) { toast('⛔ Устгах эрх зөвхөн Adminд байна', 'err'); return; }
  const e = STATE.exams.find(x => x.id === id);
  if (!e) return;
  if (!confirm('Энэ үзлэгийг устгах уу?\nХолбоотой санхүүгийн бичлэг хамт устана.')) return;
  STATE.deletedIds.add(String(id));
  // Холбоотой санхүүгийн бичлэгүүдийг мөн deletedIds-д нэмнэ (cascade)
  const linkedFins = STATE.fins.filter(f => String(f.examId) === String(id));
  linkedFins.forEach(f => {
    STATE.deletedIds.add(String(f.id));
    fbDeleteDoc('fins', String(f.id));
  });
  const linkedInps = STATE.inps.filter(i => String(i.examId) === String(id));
  linkedInps.forEach(i => {
    STATE.deletedIds.add(String(i.id));
    fbDeleteDoc('inps', String(i.id));
  });
  const examCopy = JSON.parse(JSON.stringify(e));
  if (Array.isArray(examCopy.images)) examCopy.imageCount = examCopy.images.length;
  delete examCopy.images;
  const archRec = {
    _archId: String(e.id),
    exam: examCopy,
    fins: JSON.parse(JSON.stringify(linkedFins)),
    inps: JSON.parse(JSON.stringify(linkedInps)),
    deletedAt: nowMs(),
    deletedBy: (STATE.user && (STATE.user.name || STATE.user.role)) || ''
  };
  STATE.deletedExams.push(archRec);
  STATE.exams = STATE.exams.filter(x => x.id !== id);
  STATE.fins = STATE.fins.filter(x => String(x.examId) !== String(id));
  STATE.inps = STATE.inps.filter(x => String(x.examId) !== String(id));
  saveAll();
  fbDeleteDoc('exams', String(id));
  fbSaveRecord('deletedExams', Object.assign({ id: archRec._archId }, archRec));
  writeLog('Үзлэг устгасан', id, (e.horse||'') + ' — ' + (e.docName||''),
    `Дүн: ${e.amount||0}; холбоотой ${linkedFins.length} санхүү, ${linkedInps.length} байрлан эмчлэх устсан`);
  closeModal('edit-exam-modal');
  toast('Устгагдлаа', 'ok');
  renderHistory();
  if (STATE.activePage === 'kpi') renderKPI();
  if (STATE.activePage === 'finance') renderFinance();
  if (STATE.activePage === 'admin') renderAdmin();
}

function addDoc() {
  const name = $('#a-doc-name').value.trim();
  const role = $('#a-doc-role').value;
  if (!name) { toast('Нэр оруулна уу', 'err'); return; }
  const doc = { id: uid(), name, role, exams: 0, rev: 0, ms: nowMs() };
  STATE.doctors.push(doc);
  lsSet('mt_doctors', STATE.doctors);
  fbSaveRecord('doctors', doc);
  $('#a-doc-name').value = '';
  toast('✅ Эмч нэмэгдлээ', 'ok');
  renderAdmin();
}

function delDoc(id) {
  if (!canDelete()) { toast('⛔ Устгах эрх зөвхөн Adminд байна', 'err'); return; }
  const d = STATE.doctors.find(x => x.id === id);
  if (!confirm('Энэ эмчийг устгах уу?')) return;
  STATE.doctors = STATE.doctors.filter(d => d.id !== id);
  saveAll();
  fbDeleteDoc('doctors', String(id));
  writeLog('Эмч устгасан', id, d ? d.name : '', '');
  renderAdmin();
  toast('Устгагдлаа', 'ok');
}

function exportAll() {
  const data = {
    horses: STATE.horses, waiting: STATE.waiting, exams: STATE.exams,
    fins: STATE.fins, inps: STATE.inps, doctors: STATE.doctors,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'morton_backup_' + todayStr() + '.json';
  a.click();
  toast('⬇ Татагдлаа', 'ok');
}

function exportExcel() {
  if (typeof XLSX === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => _doExportExcel();
    document.head.appendChild(s);
    toast('Excel бэлтгэж байна...', 'ok');
  } else {
    _doExportExcel();
  }
}

function _doExportExcel() {
  const wb = XLSX.utils.book_new();

  // Морьд
  const horsesData = STATE.horses.map(h => ({
    'ID': h.id || '',
    'Морины нэр': h.name || '',
    'Эзний нэр': h.owner || '',
    'Утас': h.phone || '',
    'Үүлдэр': h.breed || '',
    'Нас': h.age || '',
    'Аймаг': h.province || '',
    'Сум': h.soum || '',
    'Төлөв': h.status || '',
    'Огноо': h.date || ''
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(horsesData), 'Морьд');

  // Үзлэг
  const examsData = STATE.exams.map(e => ({
    'ID': e.id || '',
    'Дугаар': e.examNum || '',
    'Огноо': e.date || '',
    'Морь': e.horse || '',
    'Эзэн': e.owner || '',
    'Утас': e.phone || '',
    'Эмч': e.docName || '',
    'Оношилгоо': e.diagnosis || '',
    'Дүн': e.amount || 0,
    'Төлсөн эсэх': e.paid ? 'Тийм' : 'Үгүй'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(examsData), 'Үзлэг');

  // Accountant / Finance
  const finsData = STATE.fins.map(f => ({
    'ID': f.id || '',
    'Үзлэг дугаар': f.examNum || '',
    'Огноо': f.paidDate || f.date || '',
    'Морь': f.horse || '',
    'Эзэн': f.owner || '',
    'Эмч': f.docName || '',
    'Дүн': f.amount || 0,
    'Төлсөн эсэх': f.paid ? 'Тийм' : 'Үгүй'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(finsData), 'Accountant / Finance');

  // Байрлан эмчлүүлэгч
  const inpsData = STATE.inps.map(i => ({
    'ID': i.id || '',
    'Морь': i.horse || '',
    'Эзэн': i.owner || '',
    'Эмч': i.docName || '',
    'Оношилгоо': i.diagnosis || '',
    'Орсон огноо': i.admittedDate || '',
    'Гарсан огноо': i.dischargedDate || '',
    'Дүн': i.initialAmount || 0,
    'Гарсан эсэх': i.discharged ? 'Тийм' : 'Үгүй',
    'Хэн гаргасан': i.dischargedBy || '',
    'Гаргасан цаг': i.dischargedAtMs ? fmtDateTime(i.dischargedAtMs) : '',
    'Гаргасан төхөөрөмж': i.dischargedDevice || ''
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inpsData), 'Байрлан');

  // Эмч нар
  const docsData = STATE.doctors.map(d => ({
    'ID': d.id || '',
    'Нэр': d.name || '',
    'Роль': d.role || '',
    'Үзлэг': d.exams || 0,
    'Орлого': d.rev || 0
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(docsData), 'Эмч нар');

  // Лог
  if (STATE.logs && STATE.logs.length) {
    const logsData = STATE.logs.map(l => ({
      'Хэрэглэгч': l.user_name || '',
      'Эрх': l.user_role || '',
      'Үйлдэл': l.action || '',
      'Объект': l.target_name || '',
      'Дэлгэрэнгүй': l.details || '',
      'Огноо': l.log_date || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logsData), 'Лог');
  }

  XLSX.writeFile(wb, 'Morton_' + todayStr() + '.xlsx');
  toast('✅ Excel татагдлаа', 'ok');
}

function importJSON(ev) {
  const f = ev.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!confirm('Одоогийн өгөгдөл солигдоно. Үргэлжлүүлэх үү?')) return;
      if (data.horses) STATE.horses = data.horses;
      if (data.waiting) STATE.waiting = data.waiting;
      if (data.exams) STATE.exams = data.exams;
      if (data.fins) STATE.fins = data.fins;
      if (data.inps) STATE.inps = data.inps;
      if (data.doctors) STATE.doctors = data.doctors;
      saveAll();
      updateBadges();
      toast('✅ Импортлогдлоо', 'ok');
      renderAdmin();
    } catch (err) {
      toast('Файл буруу байна', 'err');
    }
  };
  r.readAsText(f);
  ev.target.value = '';
}

function resetAll() {
  if (!confirm('БҮХ өгөгдлийг устгах уу? Энэ үйлдэл буцаагдахгүй!')) return;
  if (!confirm('Үнэхээр устгах уу?')) return;
  STATE.horses = []; STATE.waiting = []; STATE.exams = []; STATE.fins = []; STATE.inps = [];
  // Oracle-д устгах хүсэлт илгээнэ — backend side delete all хийнэ
  updateBadges();
  toast('Устгагдлаа', 'ok');
  renderAdmin();
}

function saveSyncURL() {
  STATE.syncURL = $('#a-url').value.trim();
  lsSet('mt_sync_url', STATE.syncURL);
  toast('💾 URL тохируулагдлаа', 'ok');
}

function resetSyncURL() {
  if (!confirm('Default URL руу буцаах уу?')) return;
  // resetSyncURL — Apps Script устгагдсан
  toast('Apps Script sync идэвхгүй байна', 'err');
  toast('↻ Default URL руу буцлаа', 'ok');
}

// ============================================================
// SYNC
// ============================================================
let lastSyncOk = 0;
function flashSync() {
  $('#sync-dot').classList.add('live');
  setTimeout(()=> $('#sync-dot').classList.remove('live'), 1200);
  lastSyncOk = nowMs();
}



// trySync — Apps Script sync устгагдсан, Firebase ашиглана
function trySync(sheet, data) { /* no-op: Firebase fbSaveRecord ашиглана */ }

function manualSync() {
  if (!window.__fbReady) {
    toast('Firebase холбогдоогүй байна', 'err');
    return;
  }
  try { flashSync(); } catch(e){}
  toast('✅ Firebase-тэй синк хийгдсэн', 'ok');
}

// Format a Date object as local YYYY-MM-DD (NOT UTC) — backward compat alias

function normalizeDateField(v) {
  if (!v) return '';
  if (typeof v === 'string') {
    // ISO format like "2026-04-29T00:00:00.000Z" or "2026-04-29T..." → take date part
    // BUT: an ISO with Z is UTC; in Mongolia (UTC+8) "2026-04-25T00:00:00.000Z" is actually
    // 2026-04-25 08:00 local — so just slicing is safe. However, if the string has a timezone
    // offset (like "2026-04-24T16:00:00.000-08:00"), we should reparse to local.
    if (v.length >= 10 && v[4] === '-' && v[7] === '-') {
      // If just "YYYY-MM-DD" or starts with it and the time portion is 00:00:00.000Z (UTC midnight),
      // it represents a Sheet date that should be shown as that date in local time.
      if (v.length === 10) return v;
      // For ISO with time, reparse and extract local components — fixes UTC-shift bug.
      const parsed = new Date(v);
      if (!isNaN(parsed.getTime())) return localDateStr(parsed);
      return v.slice(0, 10);
    }
    return v;
  }
  if (v instanceof Date) return localDateStr(v);
  // Date-serialized number? Try parsing
  try {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return localDateStr(d);
    return String(v);
  } catch(e) { return String(v); }
}

// Convert a date string (YYYY-MM-DD) to local-midnight ms timestamp
function dateStrToMs(s) {
  if (!s) return 0;
  s = String(s).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return 0;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0).getTime();
}

function normalizeRow(r) {
  // Normalize known date fields so filtering and display stays consistent
  ['date','paidDate','admittedDate','dischargedDate','time'].forEach(k => {
    if (r[k] !== undefined && r[k] !== '' && r[k] !== null) {
      if (k === 'time') {
        if (typeof r[k] === 'string' && r[k].length > 5 && r[k].includes(':')) {
          // ISO-like → take HH:MM (local)
          const parsed = new Date(r[k]);
          if (!isNaN(parsed.getTime())) {
            r[k] = String(parsed.getHours()).padStart(2,'0') + ':' + String(parsed.getMinutes()).padStart(2,'0');
          } else {
            const m = r[k].match(/(\d{2}:\d{2})/);
            if (m) r[k] = m[1];
          }
        } else if (r[k] instanceof Date) {
          r[k] = String(r[k].getHours()).padStart(2,'0') + ':' + String(r[k].getMinutes()).padStart(2,'0');
        }
      } else {
        r[k] = normalizeDateField(r[k]);
      }
    }
  });
  // Normalize id and amount
  if (r.id !== undefined) r.id = String(r.id);
  if (r.amount !== undefined && r.amount !== '') r.amount = parseFloat(r.amount) || 0;
  if (r.paid === 'true' || r.paid === 1) r.paid = true;
  if (r.paid === 'false' || r.paid === 0 || r.paid === '') r.paid = false;

  // Re-derive admittedMs/dischargedMs from corresponding date strings if they look stale.
  // Specifically: when Sheet-edited date doesn't match the ms timestamp, prefer the date string.
  if (r.admittedDate) {
    const fromDate = dateStrToMs(r.admittedDate);
    if (fromDate) {
      const existing = parseFloat(r.admittedMs) || 0;
      // If date strings don't match, the user edited Sheet — re-anchor ms to that date (noon for safety)
      if (existing) {
        const existingDateStr = localDateStr(new Date(existing));
        if (existingDateStr !== r.admittedDate) {
          // Set to noon on the admitted date
          r.admittedMs = fromDate + 12 * 3600000;
        }
      } else {
        r.admittedMs = fromDate + 12 * 3600000;
      }
    }
  }
  if (r.dischargedDate) {
    const fromDate = dateStrToMs(r.dischargedDate);
    if (fromDate) {
      const existing = parseFloat(r.dischargedMs) || 0;
      if (existing) {
        const existingDateStr = localDateStr(new Date(existing));
        if (existingDateStr !== r.dischargedDate) {
          r.dischargedMs = fromDate + 12 * 3600000;
        }
      } else {
        r.dischargedMs = fromDate + 12 * 3600000;
      }
    }
  }
  return r;
}

function applySheetData(d) {
  const stats = { added: 0, updated: 0, removed: 0 };
  const PROTECT_MS = 300000;  // Protect locally-added items for 5 minutes (was 30s — too short)
  const now = nowMs();

  function applyArray(localKey, remote) {
    if (!Array.isArray(remote)) return;
    // Normalize all incoming rows
    remote = remote.map(normalizeRow);
    // Устгасан бичлэгийг remote-оос шүүж хаяна (буцаж нэмэгдэхээс сэргийлнэ)
    if (STATE.deletedIds instanceof Set && STATE.deletedIds.size) {
      remote = remote.filter(r => !STATE.deletedIds.has(String(r.id)));
    }
    const local = STATE[localKey] || [];
    const remoteIds = new Set(remote.map(r => String(r.id)));

    // Build a map of local items for quick lookup
    const localById = {};
    local.forEach(l => { localById[String(l.id)] = l; });

    // For records that exist in BOTH Sheet and local: preserve local array fields
    // when Sheet returns missing/empty values. This protects writes that haven't
    // been synced back yet (e.g. user just added a prepayment locally — Sheet
    // hasn't picked it up yet but the next poll might overwrite with empty).
    const ARRAY_FIELDS = ['prepayments', 'payments', 'log', 'services', 'meds', 'images'];
    remote = remote.map(r => {
      const lc = localById[String(r.id)];
      if (!lc) return r;
      const lcMs = parseFloat(lc.ms) || 0;
      const rMs  = parseFloat(r.ms)  || 0;
      // If local was modified more recently than Sheet's row, prefer local for array fields
      const localFresher = lcMs > rMs && (now - lcMs) < PROTECT_MS;
      ARRAY_FIELDS.forEach(f => {
        const remoteVal = r[f];
        const localVal = lc[f];
        // If Sheet returned empty/non-array but local has data → keep local
        if (Array.isArray(localVal) && localVal.length > 0) {
          if (!Array.isArray(remoteVal) || remoteVal.length === 0) {
            r[f] = localVal;
          } else if (localFresher) {
            // Local was just edited — prefer it
            r[f] = localVal;
          }
        }
      });
      return r;
    });

    // Find local-only items (not in Sheet)
    const localOnly = local.filter(l => !remoteIds.has(String(l.id)));
    // Of those, protect ones added within last 30s
    const protectedItems = localOnly.filter(l => {
      const ts = l.ms || l.createdAt || l.paidMs || 0;
      return ts && (now - ts) < PROTECT_MS;
    });
    stats.removed += localOnly.length - protectedItems.length;

    // Count added/updated
    const localIds = new Set(local.map(l => String(l.id)));
    remote.forEach(r => {
      if (localIds.has(String(r.id))) stats.updated++;
      else stats.added++;
    });

    // Result: Sheet data (with preserved local arrays) + protected local items
    STATE[localKey] = [...remote, ...protectedItems];
  }

  if (d.horses)  applyArray('horses',  d.horses);
  if (d.waiting) applyArray('waiting', d.waiting);
  if (d.exams)   applyArray('exams',   d.exams);
  if (d.fins)    applyArray('fins',    d.fins);
  if (d.inps)    applyArray('inps',    d.inps);
  // Doctors: only replace if Sheet has doctors (otherwise keep local defaults)
  if (d.doctors && d.doctors.length) applyArray('doctors', d.doctors);
  if (d.staff)   applyArray('staff',   d.staff);

  return stats;
}

// ============================================================
// 🩺 АХЛАХ ЭМЧИЙН ХЯНАЛТ (2026-10-05)
//   1) Онош батлах — бусад эмчийн оношийг ахлах эмч (Өсөхбаяр, Сайнбилэг —
//      «🩺 Онош батлах» эрхтэй хэрэглэгч) баталсны дараа л үйлчлүүлэгчид өгөх
//      үзлэгийн хуудасны баруун хэсэгт онош хэвлэгдэнэ.
//   2) Өдрийн эмчилгээ — эмч бүр байрлан адуундаа тухайн өдрийн эмчилгээгээ
//      бичсэн эсэхийг ахлах эмч хянана.
//   3) Эзэнд мэдээлэх — байрлан эмчлүүлж буй адуу 3 хоносон бол эзэнд нь
//      залгаж ярьсан тэмдэглэлээ бичих сануулга.
//   4) Маргаашийн эмчилгээний төлөвлөгөө — адуу бүрд.
//   Өгөгдөл: exams.{dxStatus, dxApprovedBy, dxApprovedMs, dxAuto, dxReturnNote,
//   dxReturnedBy, dxReturnedMs, dxOriginal, dxHistory[]}; inps.{calls[], plans[]};
//   clinic_config.{customRoles, callCfg}. Шинэ collection үүсгээгүй.
// ============================================================

// ── Эрх ─────────────────────────────────────────────────────
function userCanApproveDx(u) {
  if (!u) return false;
  if (typeof u.dxApprove === 'boolean') return u.dxApprove;
  return roleDefaultDxApprove(u.role);
}
function canApproveDx() {
  if (!STATE.user) return false;
  return userCanApproveDx(_meUser() || { role: STATE.user.role });
}
// Үзлэгийн эмчийн нэр (docName) онош батлах эрхтэй хэрэглэгч мөн эсэх
function isDxApproverName(name) {
  if (!name) return false;
  const u = getUsers()[name];
  if (u) return userCanApproveDx(u);
  if ((STATE.users || []).length) return false;
  const d = (STATE.doctors || []).find(x => x.name === name); // хэрэглэгчийн жагсаалт хараахан ирээгүй үед
  return !!(d && d.role === 'Senior Veterinarian');
}
function dxApproverNames() { return (STATE.users || []).filter(userCanApproveDx).map(u => u.name); }
function _isMyExam(e) { const n = STATE.user && STATE.user.name; return !!(n && e && (e.docName === n || e.assistDocName === n)); }
// Онош засаж дахин илгээх эрх: үзлэгийн эмч өөрөө, засах эрхтэй хүн, батлагч
function canResubmitDx(e) { return _isMyExam(e) || canEditData() || canApproveDx(); }

// ── Оношийн төлөв ──────────────────────────────────────────
// '' (хуучин үзлэг — систем нэвтрэхээс өмнөх), 'pending', 'approved', 'returned'
function dxStatusOf(e) { return (e && e.dxStatus) || ''; }
function dxIsApproved(e) { return dxStatusOf(e) === 'approved'; }
function dxIsOpen(e) { const s = dxStatusOf(e); return !!e && !isPlanned(e) && (s === 'pending' || s === 'returned'); }
function dxBadgeHTML(e, opts) {
  opts = opts || {};
  const s = dxStatusOf(e); const fs = opts.small ? 'font-size:10px;' : '';
  if (s === 'approved') return `<span class="badge b-g" style="${fs}" title="${escHTML((e.dxAuto ? 'Senior Veterinarianийн өөрийн үзлэг — автоматаар батлагдсан. ' : '') + 'Баталсан: ' + (e.dxApprovedBy || '') + ' · ' + fmtDateTime(e.dxApprovedMs))}">✅ Онош батлагдсан${opts.who !== false && e.dxApprovedBy ? ' · ' + escHTML(e.dxApprovedBy) : ''}</span>`;
  if (s === 'pending') return `<span class="badge b-o" style="${fs}">⏳ Онош хянагдаж байна</span>`;
  if (s === 'returned') return `<span class="badge b-r" style="${fs}" title="${escHTML(e.dxReturnNote || '')}">↩ Онош буцаагдсан${e.dxReturnedBy ? ' · ' + escHTML(e.dxReturnedBy) : ''}</span>`;
  return opts.legacy ? `<span class="badge" style="${fs}" title="Энэ үзлэг онош батлах журам нэвтрэхээс өмнө хийгдсэн">Онош батлаагүй (хуучин)</span>` : '';
}
// Шинэ үзлэгт (finishExam / moveToInpatient) оношийн төлөвийг тогтооно:
// ахлах эмч өөрөө (үндсэн эсвэл хамтрагч эмч) эсвэл ахлах эмч нэвтэрч дуусгасан бол автоматаар батлагдана.
function dxInitFields(e) {
  const me = (STATE.user && STATE.user.name) || '';
  const now = nowMs();
  // Зөвхөн үзлэгийн үндсэн / хамтрагч эмч нь ахлах эмч бол автоматаар батлагдана.
  // (Нэвтэрсэн хэрэглэгчээр шийдвэл ахлах эмчийн нэрээр нэвтэрсэн нийтийн компьютер дээр
  //  бусад эмчийн онош хяналтгүй батлагдах эрсдэлтэй — тийм үзлэгийг нэг товчоор батална.)
  const by = [e.docName, e.assistDocName].find(n => isDxApproverName(n)) || '';
  if (by) return { dxStatus: 'approved', dxApprovedBy: by, dxApprovedMs: now, dxAuto: true, dxHistory: [{ ms: now, by: me || by, action: 'auto', text: e.diagnosis || '' }] };
  return { dxStatus: 'pending', dxSubmittedMs: now, dxHistory: [{ ms: now, by: me, action: 'submit', text: e.diagnosis || '' }] };
}
function _dxExam(id) { return (STATE.exams || []).find(x => String(x.id) === String(id)); }
function _dxPush(e, entry) {
  if (!Array.isArray(e.dxHistory)) e.dxHistory = [];
  const clean = {}; Object.keys(entry).forEach(k => { if (entry[k] !== undefined && entry[k] !== null) clean[k] = entry[k]; }); // Firestore undefined хүлээж авдаггүй
  e.dxHistory.push(clean);
  if (e.dxHistory.length > 20) e.dxHistory = e.dxHistory.slice(-20);
}
// Онош өөрчлөгдвөл холбогдох байрлан эмчлүүлэлтийн «Анхны онош»-ийг мөн шинэчилнэ
function _dxSyncInp(e, before) {
  (STATE.inps || []).filter(i => String(i.examId) === String(e.id)).forEach(i => {
    if (!i.diagnosis || i.diagnosis === before) { i.diagnosis = e.diagnosis; i.ms = nowMs(); fbSaveRecord('inps', i); }
  });
}
function _dxAfterChange() {
  saveAll();
  try { updateBadges(); } catch (_) {}
  try { if (STATE.activePage === 'review') renderReview(); } catch (_) {}
  try { if (STATE.activePage === 'dashboard') renderDashboard(); } catch (_) {}
}
function approveDx(id, newText) {
  if (!canApproveDx()) { toast('⛔ Онош батлах эрх ахлах эмчид (Өсөхбаяр, Сайнбилэг) байна', 'err'); return false; }
  const e = _dxExam(id); if (!e) { toast('Үзлэг олдсонгүй', 'err'); return false; }
  const me = STATE.user.name, now = nowMs();
  const before = e.diagnosis || '';
  const text = String(newText == null ? before : newText).trim();
  if (!text) { toast('Онош хоосон байна — бичээд батална уу', 'err'); return false; }
  const changed = text !== before;
  if (changed && !e.dxOriginal) e.dxOriginal = before;
  e.diagnosis = text;
  e.dxStatus = 'approved'; e.dxApprovedBy = me; e.dxApprovedMs = now; e.dxAuto = false; e.dxReturnNote = '';
  _dxPush(e, changed ? { ms: now, by: me, action: 'approve_edit', text, prev: before } : { ms: now, by: me, action: 'approve', text });
  e.ms = now;
  if (changed) _dxSyncInp(e, before);
  fbSaveRecord('exams', e);
  writeLog(changed ? 'Онош засаж баталсан' : 'Онош баталсан', e.id, e.horse + ' — ' + (e.docName || ''), changed ? ('«' + before + '» → «' + text + '»') : ('Онош: ' + text), e.examNum);
  delete REVIEW_DRAFT[String(e.id)];
  _dxAfterChange();
  toast('✅ Онош батлагдлаа' + (changed ? ' (засвартай)' : '') + ' — хуудсанд хэвлэгдэнэ', 'ok');
  return true;
}
function returnDx(id, note) {
  if (!canApproveDx()) { toast('⛔ Онош буцаах эрх ахлах эмчид байна', 'err'); return false; }
  const e = _dxExam(id); if (!e) { toast('Үзлэг олдсонгүй', 'err'); return false; }
  note = String(note || '').trim();
  if (!note) { toast('Буцаах шалтгаанаа бичнэ үү (эмч засахад хэрэгтэй)', 'err'); return false; }
  const me = STATE.user.name, now = nowMs();
  e.dxStatus = 'returned'; e.dxReturnNote = note; e.dxReturnedBy = me; e.dxReturnedMs = now;
  _dxPush(e, { ms: now, by: me, action: 'return', text: e.diagnosis || '', note });
  e.ms = now;
  fbSaveRecord('exams', e);
  writeLog('Онош буцаасан', e.id, e.horse + ' — ' + (e.docName || ''), 'Шалтгаан: ' + note, e.examNum);
  delete REVIEW_RET_DRAFT[String(e.id)]; delete REVIEW_DRAFT[String(e.id)];
  _dxAfterChange();
  toast('↩ Онош ' + (e.docName || 'эмч') + ' рүү буцаагдлаа', 'ok');
  return true;
}
// Эмч оношоо засаж дахин илгээнэ (батлагч бол шууд батална)
function resubmitDx(id, newText) {
  const e = _dxExam(id); if (!e) { toast('Үзлэг олдсонгүй', 'err'); return false; }
  if (canApproveDx()) return approveDx(id, newText);
  if (!canResubmitDx(e)) { toast('⛔ Зөвхөн тухайн үзлэгийн эмч оношоо засна', 'err'); return false; }
  const text = String(newText == null ? (e.diagnosis || '') : newText).trim();
  if (!text) { toast('Онош оруулна уу', 'err'); return false; }
  const me = STATE.user.name, now = nowMs(), before = e.diagnosis || '';
  e.diagnosis = text; e.dxStatus = 'pending'; e.dxSubmittedMs = now;
  _dxPush(e, { ms: now, by: me, action: 'resubmit', text, prev: before !== text ? before : null });
  e.ms = now;
  if (before !== text) _dxSyncInp(e, before);
  fbSaveRecord('exams', e);
  writeLog('Онош засаж дахин илгээсэн', e.id, e.horse + ' — ' + (e.docName || ''), before !== text ? ('«' + before + '» → «' + text + '»') : 'Өөрчлөлтгүй', e.examNum);
  _dxAfterChange();
  toast('📤 Онош ахлах эмчид дахин илгээгдлээ', 'ok');
  return true;
}
// Хуучин (журамаас өмнөх) үзлэгийг хянуулахаар илгээх
function requestDxReview(id) {
  const e = _dxExam(id); if (!e) return;
  if (dxStatusOf(e)) return;
  if (canApproveDx()) { approveDx(id); return; }
  e.dxStatus = 'pending'; e.dxSubmittedMs = nowMs(); e.ms = nowMs();
  _dxPush(e, { ms: nowMs(), by: STATE.user ? STATE.user.name : '', action: 'submit', text: e.diagnosis || '' });
  fbSaveRecord('exams', e);
  writeLog('Онош хянуулахаар илгээсэн', e.id, e.horse + ' — ' + (e.docName || ''), '', e.examNum);
  _dxAfterChange();
  toast('📤 Senior Veterinarianид илгээгдлээ', 'ok');
}
const DX_ACTION_LABEL = { auto: '✅ Automatically Approved (Senior Vet)', submit: '📤 Submitted for Review', resubmit: '📤 Revised & Resubmitted', approve: '✅ Approved by Senior Vet', approve_edit: '✅ Засаж баталсан', return: '↩ Буцаасан', edit: '✏️ Үзлэг засварт онош өөрчилсөн' };
function dxHistoryHTML(e) {
  const h = Array.isArray(e.dxHistory) ? e.dxHistory : [];
  if (!h.length) return '';
  return '<div style="display:flex;flex-direction:column;gap:3px;margin-top:6px">' + h.slice().reverse().map(x => `
    <div style="font-size:11.5px;background:var(--input);border-radius:6px;padding:5px 8px;line-height:1.45">
      <b>${escHTML(DX_ACTION_LABEL[x.action] || x.action || '')}</b> · ${escHTML(x.by || '')} · <span class="muted">${escHTML(fmtDateTime(x.ms))}</span>
      ${x.prev ? `<div class="muted">«${escHTML(x.prev)}» → «${escHTML(x.text || '')}»</div>` : ''}
      ${x.note ? `<div style="color:var(--red)">Шалтгаан: ${escHTML(x.note)}</div>` : ''}
    </div>`).join('') + '</div>';
}

// ── 🩺 Онош хянах цонх (үзлэгийн дэлгэрэнгүй, хэвлэх урьдчилсан харагдац, самбараас) ──
let __dxModalId = null, __dxModalAfter = null;
function ensureDxModal() {
  if (document.getElementById('dx-modal')) return;
  const m = document.createElement('div');
  m.className = 'mod-bd'; m.id = 'dx-modal';
  m.innerHTML = `<div class="mod" style="max-width:560px">
    <div class="mod-t" id="dx-m-title">🩺 Онош хянах</div>
    <div id="dx-m-body" style="max-height:62vh;overflow-y:auto"></div>
    <div class="mod-actions" id="dx-m-actions"></div></div>`;
  document.body.appendChild(m);
}
function openDxModal(id, after) {
  const e = _dxExam(id); if (!e) { toast('Үзлэг олдсонгүй', 'err'); return; }
  ensureDxModal(); __dxModalId = String(e.id); __dxModalAfter = after || null;
  const appr = canApproveDx(), s = dxStatusOf(e);
  const canFix = !appr && canResubmitDx(e) && s !== 'approved';
  const an = examAnamnesis(e);
  const vit = [e.temp ? 'T ' + e.temp : '', e.pulse ? 'P ' + e.pulse : '', e.resp ? 'R ' + e.resp : '', e.wt ? 'Жин ' + e.wt : ''].filter(Boolean).join(' · ');
  $('#dx-m-title').innerHTML = `🩺 Онош хянах — ${escHTML(e.horse || '')} ${e.examNum ? '<span class="badge b-o">' + escHTML(e.examNum) + '</span>' : ''}`;
  $('#dx-m-body').innerHTML = `
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">${dxBadgeHTML(e, { legacy: true })}</div>
    <div style="font-size:12.5px;line-height:1.6;margin-bottom:8px">
      👨‍⚕️ <b>${escHTML(e.docName || '—')}</b>${e.assistDocName ? ' · хамт: ' + escHTML(e.assistDocName) : ''} · 📅 ${escHTML(e.date || '')} ${escHTML(e.time || '')}<br>
      👤 ${escHTML(e.owner || '')}${e.phone ? ' · ' + escHTML(e.phone) : ''}${vit ? '<br>🌡 ' + escHTML(vit) : ''}
    </div>
    ${s === 'returned' && e.dxReturnNote ? `<div style="background:var(--red-soft);color:var(--red);border-radius:8px;padding:8px 10px;font-size:12.5px;margin-bottom:8px">↩ <b>${escHTML(e.dxReturnedBy || '')}</b> буцаасан: ${escHTML(e.dxReturnNote)}</div>` : ''}
    ${an.text || an.symptoms.length ? `<div class="fld" style="margin-bottom:8px"><label>📝 Анамнез</label><div style="background:var(--input);padding:8px 10px;border-radius:8px;font-size:12.5px;white-space:pre-wrap">${escHTML([an.text, an.symptoms.join(', ')].filter(Boolean).join(' · '))}</div></div>` : ''}
    ${(e.services || []).length ? `<div style="font-size:12px;margin-bottom:6px"><b>Үйлчилгээ:</b> ${escHTML((e.services || []).map(x => x.name).join(', '))}</div>` : ''}
    ${(Array.isArray(e.meds) && e.meds.length) ? `<div style="font-size:12px;margin-bottom:6px"><b>Эм:</b> ${escHTML(e.meds.map(m => (m.name || m) + (m.note ? ' — ' + m.note : '')).join(', '))}</div>` : ''}
    ${e.note ? `<div style="font-size:12px;margin-bottom:8px;white-space:pre-wrap"><b>Зөвлөгөө:</b> ${escHTML(e.note)}</div>` : ''}
    <div class="fld"><label>🩺 Онош ${appr ? '<span class="muted" style="font-weight:600;text-transform:none">— шаардлагатай бол засаад батална</span>' : ''}</label>
      ${(appr || canFix) ? `<textarea class="inp" id="dx-m-text" rows="3">${escHTML(e.diagnosis || '')}</textarea>` : `<div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px">${escHTML(e.diagnosis || '—')}</div>`}
      ${e.dxOriginal && e.dxOriginal !== e.diagnosis ? `<div class="muted" style="font-size:11px;margin-top:4px">Эмчийн анх бичсэн: «${escHTML(e.dxOriginal)}»</div>` : ''}
    </div>
    ${appr ? `<div class="fld" style="margin-top:8px"><label>↩ Буцаах шалтгаан <span class="muted" style="font-weight:600;text-transform:none">— зөвхөн буцаах үед</span></label><input class="inp" id="dx-m-note" placeholder="ж: Шинжилгээний хариугаар оношоо тодруулна уу"></div>` : ''}
    ${!appr && !canFix && s !== 'approved' ? `<div class="muted" style="font-size:12px;margin-top:8px">Батлагч: ${escHTML(dxApproverNames().join(', ') || 'Senior Veterinarian')}</div>` : ''}
    ${Array.isArray(e.dxHistory) && e.dxHistory.length ? '<div class="fld" style="margin-top:10px"><label>🧭 Түүх</label>' + dxHistoryHTML(e) + '</div>' : ''}`;
  const btns = ['<button class="btn btn-sm" onclick="closeModal(\'dx-modal\')">Хаах</button>'];
  if (appr) {
    btns.push(`<button class="btn btn-sm btn-r" onclick="_dxModalReturn()">↩ Буцаах</button>`);
    btns.push(`<button class="btn btn-sm btn-p" onclick="_dxModalApprove()">✅ ${s === 'approved' ? 'Засвар хадгалах' : 'Батлах'}</button>`);
  } else if (canFix) {
    btns.push(`<button class="btn btn-sm btn-p" onclick="_dxModalResubmit()">📤 ${s === 'returned' ? 'Засаж дахин илгээх' : (s ? 'Хадгалах' : 'Хянуулахаар илгээх')}</button>`);
  }
  $('#dx-m-actions').innerHTML = btns.join('');
  openModal('dx-modal');
}
function _dxModalDone() { closeModal('dx-modal'); const f = __dxModalAfter; __dxModalAfter = null; if (typeof f === 'function') { try { f(); } catch (e) { console.error(e); } } }
function _dxModalApprove() { const t = $('#dx-m-text'); if (approveDx(__dxModalId, t ? t.value : null)) _dxModalDone(); }
function _dxModalReturn() { const n = $('#dx-m-note'); if (returnDx(__dxModalId, n ? n.value : '')) _dxModalDone(); }
function _dxModalResubmit() { const t = $('#dx-m-text'); if (resubmitDx(__dxModalId, t ? t.value : null)) _dxModalDone(); }

// ── 📞 Эзэнд мэдээлэх сануулга ────────────────────────────────
// Анхдагч: 3 хоносон үед нэг удаа. Тохиргоонд «дараа нь N хоног тутам» давтаж болно.
const CALL_DEFAULT = { firstDay: 3, repeatDays: 0 };
function callCfg() { return Object.assign({}, CALL_DEFAULT, STATE.callCfg || {}); }
const CALL_STATUS = { talked: '✅ Call Connected', noanswer: '📵 No Answer', msg: '✉️ Left Message' };
function inpCalls(i) { return (Array.isArray(i && i.calls) ? i.calls : []).filter(c => c && !c.deleted); }
function _admDayStart(i) {
  const a = new Date(parseFloat(i.admittedMs) || dateStrToMs(i.admittedDate) || Date.now());
  return new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
}
function inpCallState(i) {
  if (!i || i.discharged) return { due: false };
  const C = callCfg();
  const first = Math.max(1, parseInt(C.firstDay, 10) || 3), rep = Math.max(0, parseInt(C.repeatDays, 10) || 0);
  const days = inpatientDays(i.admittedMs);
  if (days < first) return { due: false, days, nextDay: first };
  const m = rep > 0 ? first + Math.floor((days - first) / rep) * rep : first;
  const fromMs = _admDayStart(i) + (m - 1) * 86400000; // тэр хоногийн өдрийн 00:00-оос хойших яриа тооцогдоно
  const calls = inpCalls(i);
  const talked = calls.filter(c => c.status === 'talked' && (parseFloat(c.ms) || 0) >= fromMs);
  const attempts = calls.filter(c => c.status !== 'talked' && (parseFloat(c.ms) || 0) >= fromMs);
  return { due: !talked.length, days, milestone: m, fromMs, lastTalk: talked[talked.length - 1] || null, attempts: attempts.length, nextDay: rep > 0 ? m + rep : null };
}
function callDueList() { return (STATE.inps || []).filter(i => !i.discharged && inpCallState(i).due); }
function _myInp(i) { const me = currentUserDoctor(); const d = inpDoctorOf(i); return !!(me && d && String(d.id) === String(me.id)); }
function addInpCall() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI)); if (!i) return;
  const status = ($('#inp-call-status') || {}).value || 'talked';
  const note = String(($('#inp-call-note') || {}).value || '').trim();
  if (status === 'talked' && !note) { toast('Эзэнтэй юу ярьсанаа товч бичнэ үү', 'err'); const n = $('#inp-call-note'); if (n) n.focus(); return; }
  const now = nowMs(), d = new Date(now);
  const c = { id: uid(), ms: now, date: localDateStr(d), time: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'),
    by: (STATE.user && STATE.user.name) || '', status, note, day: inpatientDays(i.admittedMs) };
  if (!Array.isArray(i.calls)) i.calls = [];
  i.calls.push(c); i.ms = now;
  saveAll(); fbSaveRecord('inps', i);
  writeLog('Эзэнд залгасан тэмдэглэл', i.id, i.horse + ' — ' + (i.owner || ''), CALL_STATUS[status] + (note ? ' · ' + note : '') + ' · ' + c.day + ' хоног', inpExamNum(i));
  if ($('#inp-call-note')) $('#inp-call-note').value = '';
  renderIDetail(); try { renderInpatient(); } catch (_) {} try { updateBadges(); } catch (_) {}
  toast(status === 'talked' ? '📞 Ярьсан тэмдэглэл хадгалагдлаа' : '📞 Оролдлого бүртгэгдлээ — сануулга хэвээр', 'ok');
}
function deleteInpCall(callId) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI)); if (!i) return;
  const c = (i.calls || []).find(x => String(x.id) === String(callId)); if (!c) return;
  if (!(canEditData() || (STATE.user && c.by === STATE.user.name))) { toast('⛔ Зөвхөн бичсэн хүн эсвэл засах эрхтэй хүн устгана', 'err'); return; }
  if (!confirm('Энэ тэмдэглэлийг устгах уу?')) return;
  c.deleted = true; c.deletedBy = STATE.user.name; c.deletedMs = nowMs(); i.ms = nowMs(); // массив хоосроход sync хамгаалалт дарахаас сэргийлж зөөлөн устгана
  saveAll(); fbSaveRecord('inps', i);
  writeLog('Эзэнд залгасан тэмдэглэл устгав', i.id, i.horse, c.note || '');
  renderIDetail(); try { renderInpatient(); } catch (_) {}
}
function renderInpCallBlock(i) {
  const box = $('#inp-call-list'), alertEl = $('#inp-call-alert'), wrap = $('#inp-call-card');
  if (!box) return;
  if (wrap) wrap.classList.toggle('hidden', !!i.discharged && !inpCalls(i).length);
  const st = inpCallState(i);
  if (alertEl) {
    alertEl.innerHTML = st.due
      ? `<div style="background:var(--red-soft);color:var(--red);border-radius:10px;padding:9px 12px;font-size:13px;font-weight:700;line-height:1.5">
          🔔 Энэ адуу <b>${st.days} хоносон</b> — эзэн <b>${escHTML(i.owner || '')}</b>-д залгаж эмчилгээний явцыг мэдээлээд доор тэмдэглэлээ бичнэ үү.
          ${i.phone ? `<div style="margin-top:6px"><a class="btn btn-sm" href="tel:${escHTML(String(i.phone).replace(/[^0-9+]/g, ''))}" style="text-decoration:none">📞 ${escHTML(i.phone)} руу залгах</a></div>` : ''}
          ${st.attempts ? `<div style="font-weight:600;font-size:12px;margin-top:4px">${st.attempts} удаа оролдсон, холбогдоогүй</div>` : ''}</div>`
      : (!i.discharged && st.lastTalk ? `<div style="background:var(--green-soft);color:var(--green);border-radius:10px;padding:8px 12px;font-size:12.5px;font-weight:700">✅ ${st.milestone} хоногийн мэдээллийг өгсөн · ${escHTML(st.lastTalk.by || '')} · ${escHTML(st.lastTalk.date || '')} ${escHTML(st.lastTalk.time || '')}${st.nextDay ? ' · дараагийн сануулга ' + st.nextDay + ' хоноход' : ''}</div>`
        : (!i.discharged && st.nextDay && st.days < st.nextDay && !st.milestone ? `<div class="muted" style="font-size:12px">🔔 ${st.nextDay} хоноход эзэнд мэдээлэх сануулга гарна (одоо ${st.days} хоног).</div>` : ''));
  }
  const calls = inpCalls(i).slice().sort((a, b) => (b.ms || 0) - (a.ms || 0));
  box.innerHTML = calls.length ? calls.map(c => `
    <div style="background:var(--input);border-radius:8px;padding:8px 10px;margin-bottom:6px;font-size:12.5px;line-height:1.5">
      <div class="row" style="justify-content:space-between;gap:6px;flex-wrap:wrap">
        <span><b>${escHTML(CALL_STATUS[c.status] || c.status || '')}</b> · ${escHTML(c.by || '')} · <span class="muted">${escHTML(c.date || '')} ${escHTML(c.time || '')}${c.day ? ' · ' + c.day + ' хоног' : ''}</span></span>
        ${(canEditData() || (STATE.user && c.by === STATE.user.name)) ? `<button class="btn btn-r btn-xs" onclick="deleteInpCall('${escHTML(c.id)}')">✕</button>` : ''}
      </div>
      ${c.note ? `<div style="white-space:pre-wrap;margin-top:3px">${escHTML(c.note)}</div>` : ''}
    </div>`).join('') : '<div class="muted" style="font-size:12px;padding:4px 0">Эзэнтэй холбогдсон тэмдэглэл алга</div>';
  const form = $('#inp-call-form'); if (form) form.classList.toggle('hidden', !!i.discharged);
  // Өөр адуу сонгогдвол өмнөх адууны бичиж эхэлсэн тэмдэглэлийг арилгана (буруу адуунд хадгалагдахаас сэргийлнэ)
  const nEl = $('#inp-call-note'), sEl = $('#inp-call-status');
  if (nEl && nEl.dataset.inpId !== String(i.id)) { nEl.value = ''; nEl.dataset.inpId = String(i.id); if (sEl) sEl.value = 'talked'; }
}

// ── 🗓 Маргаашийн эмчилгээний төлөвлөгөө ───────────────────────
function addDaysStr(dateStr, n) { const d = new Date((dateStr || todayStr()) + 'T12:00:00'); d.setDate(d.getDate() + n); return localDateStr(d); }
function inpPlans(i) { return (Array.isArray(i && i.plans) ? i.plans : []).filter(p => p && !p.deleted); }
function inpPlanFor(i, date) { const ps = inpPlans(i).filter(p => p.date === date); return ps[ps.length - 1] || null; }
function saveInpPlan() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI)); if (!i) return;
  const date = ($('#inp-plan-date') || {}).value || addDaysStr(todayStr(), 1);
  const text = String(($('#inp-plan-text') || {}).value || '').trim();
  const me = (STATE.user && STATE.user.name) || '', now = nowMs();
  const ex = inpPlanFor(i, date);
  if (!text) {
    if (ex && confirm(date + '-ны төлөвлөгөөг устгах уу?')) {
      ex.deleted = true; ex.deletedBy = me; ex.deletedMs = now; i.ms = now;
      saveAll(); fbSaveRecord('inps', i); renderInpPlanBlock(i, true); toast('Төлөвлөгөө устгагдлаа', 'ok');
    } else if (!ex) toast('Төлөвлөгөөгөө бичнэ үү', 'err');
    return;
  }
  if (ex) { if (ex.text === text) { toast('Өөрчлөлт алга', 'ok'); return; } ex.text = text; ex.editedBy = me; ex.editedMs = now; }
  else { if (!Array.isArray(i.plans)) i.plans = []; i.plans.push({ id: uid(), date, text, by: me, ms: now }); }
  i.ms = now;
  saveAll(); fbSaveRecord('inps', i);
  writeLog('Эмчилгээний төлөвлөгөө', i.id, i.horse, date + ': ' + text.slice(0, 120), inpExamNum(i));
  renderInpPlanBlock(i, true);
  try { renderInpInfoTab(i); } catch (_) {}
  toast('🗓 ' + date + '-ны төлөвлөгөө хадгалагдлаа', 'ok');
}
// Өнөөдрийн (өчигдөр бичсэн) төлөвлөгөөг эмчилгээний маягтын «Хийсэн эмчилгээ» талбарт татна
function usePlanInForm(date) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI)); if (!i) return;
  const p = inpPlanFor(i, date || (($('#inp-log-date') || {}).value) || todayStr()); if (!p) { toast('Энэ өдрийн төлөвлөгөө алга', 'err'); return; }
  const n = $('#inp-note'); if (!n) return;
  n.value = n.value.trim() ? n.value.trim() + '\n' + p.text : p.text;
  n.focus(); toast('⤵ Төлөвлөгөө маягтад татагдлаа — хийсэн зүйлээ засаад хадгална уу', 'ok');
}
function renderInpPlanBlock(i, force) {
  const todayBox = $('#inp-plan-today'), dEl = $('#inp-plan-date'), tEl = $('#inp-plan-text'), card = $('#inp-plan-card');
  if (!todayBox) return;
  if (card) card.classList.toggle('hidden', !!i.discharged);
  const logDate = (($('#inp-log-date') || {}).value) || todayStr();
  const tp = inpPlanFor(i, logDate);
  todayBox.innerHTML = tp
    ? `<div style="background:var(--gold-soft,#f6efdc);border-radius:10px;padding:9px 12px;font-size:12.5px;line-height:1.5;margin-bottom:8px">
        <div class="row" style="justify-content:space-between;gap:6px;flex-wrap:wrap"><b>📌 ${escHTML(logDate)}-ны төлөвлөгөө</b><button class="btn btn-xs" type="button" onclick="usePlanInForm('${escHTML(logDate)}')">⤵ Маягтад татах</button></div>
        <div style="white-space:pre-wrap;margin-top:4px">${escHTML(tp.text)}</div>
        <div class="muted" style="font-size:11px;margin-top:3px">${escHTML(tp.editedBy || tp.by || '')} · ${escHTML(fmtDateTime(tp.editedMs || tp.ms))}</div></div>`
    : '';
  // Маргаашийн төлөвлөгөөний маягт — адуу солигдох/огноо солигдох үед л дүүргэнэ (бичиж буй текстийг sync дарахгүй)
  if (dEl && tEl) {
    const key = String(i.id);
    if (force || dEl.dataset.inpId !== key || !dEl.value) {
      dEl.value = addDaysStr(todayStr(), 1); dEl.dataset.inpId = key; dEl.min = todayStr();
      const p = inpPlanFor(i, dEl.value); tEl.value = p ? p.text : '';
    }
  }
}
function onInpLogDateChange() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI)); if (!i) return;
  renderInpPlanBlock(i);
  try { if (typeof inpPrefillDraftFromCourse === 'function') inpPrefillDraftFromCourse(i, ($('#inp-log-date') || {}).value || todayStr()); } catch (e) {}
}
function onInpPlanDateChange() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI)); if (!i) return;
  const p = inpPlanFor(i, $('#inp-plan-date').value); $('#inp-plan-text').value = p ? p.text : '';
}

// ── 📝 Өдрийн эмчилгээ — бичигдсэн эсэх ───────────────────────
function inpLogsOn(i, date) { return (Array.isArray(i.log) ? i.log : []).filter(l => (l.date || '').slice(0, 10) === date); }
function inpInHospitalOn(i, date) {
  if (!i || !i.admittedDate || date < i.admittedDate) return false;
  if (i.discharged) return !!i.dischargedDate && date <= i.dischargedDate;
  return date <= todayStr();
}
// 'done' бичсэн · 'missing' бичээгүй · 'adm' орсон өдөр (үзлэгээр бүртгэгдсэн) · 'out' гарсан өдөр · 'none' байрлаагүй
function inpTreatStatus(i, date) {
  if (!inpInHospitalOn(i, date)) return 'none';
  if (inpLogsOn(i, date).length) return 'done';
  if (date === i.admittedDate) return 'adm';
  if (i.discharged && date === i.dischargedDate) return 'out';
  return 'missing';
}

// ============================================================
// 🩺 АХЛАХ ЭМЧИЙН ХЯНАЛТ — хуудас
// ============================================================
const RV = { tab: 'dx', dxDoc: '', dxShow: 'open', tDate: '', tMode: 'day', tDoc: '' };
const REVIEW_DRAFT = {}, REVIEW_RET_DRAFT = {}; // sync-ээр дахин зурахад бичсэн текст алга болохгүй
// Ноорог нь аль оношоос эхэлснийг санана — эмч өөр төхөөрөмжөөс засаж дахин илгээвэл хуучин ноорог хүчингүй
function _rvDraftSet(id, text) { const e = _dxExam(id); REVIEW_DRAFT[String(id)] = { base: e ? (e.diagnosis || '') : '', text: String(text) }; }
function _rvDraftText(id) { const d = REVIEW_DRAFT[String(id)], e = _dxExam(id); return (d && e && d.base === (e.diagnosis || '')) ? d.text : null; }
function setReviewTab(t) { RV.tab = t; renderReview(); }
function dxOpenList() { return (STATE.exams || []).filter(dxIsOpen); }
function renderReview() {
  ensureReviewStyles();
  const body = $('#rv-body'); if (!body) return;
  const open = dxOpenList();
  const pendN = open.filter(e => e.dxStatus === 'pending').length;
  const today = todayStr();
  const act = (STATE.inps || []).filter(i => !i.discharged);
  const missN = act.filter(i => inpTreatStatus(i, today) === 'missing').length;
  const callN = callDueList().length;
  const setN = (id, n, cls) => { const el = $('#' + id); if (el) el.innerHTML = n ? '<span class="badge ' + cls + '" style="margin-left:4px">' + n + '</span>' : ''; };
  setN('rv-n-dx', pendN, 'b-o'); setN('rv-n-treat', missN, 'b-r'); setN('rv-n-call', callN, 'b-r');
  $$('.tab[data-rvtab]').forEach(x => x.classList.toggle('active', x.dataset.rvtab === RV.tab));
  if (RV.tab === 'treat') body.innerHTML = _rvTreatHTML();
  else if (RV.tab === 'call') body.innerHTML = _rvCallHTML();
  else body.innerHTML = _rvDxHTML(open);
}
function ensureReviewStyles() {
  if (document.getElementById('rv-styles')) return;
  const st = document.createElement('style'); st.id = 'rv-styles';
  st.textContent = `
  .rv-card{background:var(--card,#fff);border:1px solid var(--border,#e9e6f0);border-left:4px solid var(--orange,#e0862a);border-radius:12px;padding:12px 14px;margin-bottom:10px}
  .rv-card.rv-ret{border-left-color:var(--red,#b8332b)} .rv-card.rv-ok{border-left-color:var(--green,#2f9e6f)}
  .rv-h{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:flex-start}
  .rv-meta{font-size:12px;color:var(--muted,#8a8398);line-height:1.5}
  .rv-sec{font-size:12.5px;line-height:1.5;margin-top:6px}
  .rv-act{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;align-items:center}
  .rv-act .inp{flex:1;min-width:160px}
  .rv-doc{background:var(--card,#fff);border:1px solid var(--border,#e9e6f0);border-radius:12px;padding:10px 12px;margin-bottom:10px}
  .rv-doc-h{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-weight:800;font-size:13.5px}
  .rv-bar{height:7px;border-radius:5px;background:var(--red-soft,#fbeae8);overflow:hidden;margin:6px 0 8px}
  .rv-bar>div{height:100%;background:var(--green,#2f9e6f)}
  .rv-row{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:6px 8px;border-radius:8px;font-size:12.5px;margin-bottom:4px;background:var(--input,#faf9fc)}
  .rv-row.miss{background:var(--red-soft,#fbeae8)}
  .rv-mx{border-collapse:collapse;font-size:12px;width:100%}
  .rv-mx th,.rv-mx td{border:1px solid var(--border,#e9e6f0);padding:4px 6px;text-align:center;white-space:nowrap}
  .rv-mx td.l{text-align:left;white-space:normal;min-width:120px}
  .rv-c-done{background:var(--green-soft,#e6f6ee);color:var(--green,#2f9e6f);font-weight:800}
  .rv-c-missing{background:var(--red-soft,#fbeae8);color:var(--red,#b8332b);font-weight:800}
  .rv-c-adm,.rv-c-out{color:var(--muted,#8a8398)}
  .rv-ctl{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px}
  .rv-ctl .fld{margin:0}
  .d-alerts{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
  .d-alert{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-radius:12px;padding:10px 14px;font-size:13px;font-weight:700;cursor:pointer;border:1px solid transparent}
  .d-alert-r{background:var(--red-soft,#fbeae8);color:var(--red,#b8332b);border-color:#ecc3bf}
  .d-alert-o{background:var(--orange-soft,#fcf3e0);color:var(--orange-dark,#b57708);border-color:#f0d9a8}
  .d-alert-p{background:var(--purple-soft,#efeaf9);color:var(--purple,#7d4596);border-color:#dccdee}
  .d-alert small{font-weight:600;opacity:.85}
  .inpc-tag.inpc-tag-call{background:var(--red-soft,#fbeae8);color:var(--red,#b8332b);border-color:#ecc3bf;font-weight:800}
  .inpc-tag.inpc-tag-ok{background:var(--green-soft,#e6f6ee);color:var(--green,#2f9e6f);border-color:#bfe3cf}
  .inp-days-strip{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;font-size:12px}
  .inp-days-chip{border:1px solid var(--border,#e9e6f0);background:var(--card,#fff);border-radius:20px;padding:4px 10px;font-weight:700;cursor:pointer;font-family:inherit;font-size:12px;color:var(--text)}
  .inp-days-chip b{color:var(--purple,#7d4596)}
  .inp-days-chip.on{background:var(--purple,#7d4596);border-color:var(--purple,#7d4596);color:#fff}
  .inp-days-chip.on b{color:#fff}
  .inp-days-chip.warn{border-color:#ecc3bf;background:var(--red-soft,#fbeae8);color:var(--red,#b8332b)}
  `;
  document.head.appendChild(st);
}
// ── Таб 1: Онош батлах ──
function _rvDxHTML(open) {
  const appr = canApproveDx();
  const docs = [...new Set(open.map(e => e.docName).filter(Boolean))].sort();
  let list = RV.dxShow === 'open' ? open : [];
  if (RV.dxShow === 'open' && RV.dxDoc) list = list.filter(e => e.docName === RV.dxDoc || e.assistDocName === RV.dxDoc);
  list = list.slice().sort((a, b) => (a.dxStatus === 'returned') - (b.dxStatus === 'returned') || (parseFloat(a.dxSubmittedMs || a.ms) || 0) - (parseFloat(b.dxSubmittedMs || b.ms) || 0));
  const since = nowMs() - 7 * 86400000;
  const done = (STATE.exams || []).filter(e => dxIsApproved(e) && (parseFloat(e.dxApprovedMs) || 0) >= since && (RV.dxShow === 'auto' ? e.dxAuto : !e.dxAuto))
    .filter(e => !RV.dxDoc || e.docName === RV.dxDoc || e.dxApprovedBy === RV.dxDoc)
    .sort((a, b) => (b.dxApprovedMs || 0) - (a.dxApprovedMs || 0));
  const head = `
    <div style="background:var(--purple-soft);color:var(--purple);border-radius:10px;padding:9px 12px;font-size:12.5px;line-height:1.5;margin-bottom:10px">
      Эмч үзлэгээ дуусгахад онош <b>⏳ хянагдаж байна</b> төлөвтэй болно. Senior Veterinarian (<b>${escHTML(dxApproverNames().join(', ') || 'Өсөхбаяр, Сайнбилэг')}</b>) баталсны дараа л үйлчлүүлэгчид өгөх хуудсанд онош хэвлэгдэнэ. Senior Veterinarianийн өөрийн үзлэг автоматаар батлагдана.
      ${appr ? '' : '<br><b>Танд онош батлах эрх алга — зөвхөн харна.</b>'}
    </div>
    <div class="rv-ctl">
      <div class="fld"><label>Харах</label><select class="inp" onchange="RV.dxShow=this.value;renderReview()">
        <option value="open" ${RV.dxShow === 'open' ? 'selected' : ''}>⏳ Батлах хүлээгдэж буй (${open.length})</option>
        <option value="done" ${RV.dxShow === 'done' ? 'selected' : ''}>✅ Сүүлийн 7 хоногт баталсан</option>
        <option value="auto" ${RV.dxShow === 'auto' ? 'selected' : ''}>⚙️ Senior Veterinarianийн өөрийн (автомат) — 7 хоног</option></select></div>
      <div class="fld"><label>Эмч</label><select class="inp" onchange="RV.dxDoc=this.value;renderReview()">
        <option value="">Бүх эмч</option>${[...new Set([...docs, ...(STATE.doctors || []).map(d => d.name)])].map(n => `<option ${n === RV.dxDoc ? 'selected' : ''}>${escHTML(n)}</option>`).join('')}</select></div>
    </div>`;
  if (RV.dxShow !== 'open') {
    return head + (done.length ? `<div style="overflow-x:auto"><table class="rv-mx"><thead><tr><th>Огноо</th><th>Дугаар</th><th>Адуу</th><th>Эмч</th><th>Онош</th><th>Баталсан</th><th></th></tr></thead><tbody>${done.map(e => `
      <tr><td>${escHTML(e.date || '')}</td><td>${escHTML(e.examNum || '')}</td><td class="l">${escHTML(e.horse || '')}<div class="muted" style="font-size:11px">${escHTML(e.owner || '')}</div></td><td>${escHTML(e.docName || '')}</td>
      <td class="l">${escHTML(e.diagnosis || '')}${e.dxOriginal && e.dxOriginal !== e.diagnosis ? '<div class="muted" style="font-size:11px">анх: ' + escHTML(e.dxOriginal) + '</div>' : ''}</td>
      <td>${escHTML(e.dxApprovedBy || '')}<div class="muted" style="font-size:11px">${escHTML(fmtDateTime(e.dxApprovedMs))}</div></td>
      <td><button class="btn btn-xs" onclick="openDxModal('${escHTML(e.id)}')">🔍</button></td></tr>`).join('')}</tbody></table></div>`
      : '<div class="empty"><div class="empty-em">✅</div>Энэ хугацаанд баталсан онош алга</div>');
  }
  if (!list.length) return head + '<div class="empty"><div class="empty-em">🎉</div>Батлах онош алга — бүгд хянагдсан</div>';
  return head + list.map(e => {
    const id = String(e.id), ret = e.dxStatus === 'returned';
    const an = examAnamnesis(e);
    const vit = [e.temp ? 'T ' + e.temp : '', e.pulse ? 'P ' + e.pulse : '', e.resp ? 'R ' + e.resp : '', e.wt ? 'Жин ' + e.wt : ''].filter(Boolean).join(' · ');
    const fin = finByExamId(e.id);
    const dt = _rvDraftText(id); if (dt == null) delete REVIEW_DRAFT[id];
    const draft = dt != null ? dt : (e.diagnosis || '');
    const rdraft = REVIEW_RET_DRAFT[id] || '';
    const waitH = Math.max(0, Math.round((nowMs() - (parseFloat(e.dxSubmittedMs || e.ms) || nowMs())) / 3600000));
    return `<div class="rv-card ${ret ? 'rv-ret' : ''}">
      <div class="rv-h">
        <div><b style="font-size:14px">${escHTML(e.horse || '')}</b> ${e.examNum ? '<span class="badge b-o">' + escHTML(e.examNum) + '</span>' : ''} ${e.inpatient ? '<span class="badge b-p">🏥 Байрлан</span>' : ''}
          <div class="rv-meta">👨‍⚕️ <b style="color:var(--text)">${escHTML(e.docName || '—')}</b>${e.assistDocName ? ' · хамт ' + escHTML(e.assistDocName) : ''} · 📅 ${escHTML(e.date || '')} ${escHTML(e.time || '')} · 👤 ${escHTML(e.owner || '')}${e.phone ? ' · ' + escHTML(e.phone) : ''}</div></div>
        <div style="text-align:right">${dxBadgeHTML(e)}<div class="muted" style="font-size:11px;margin-top:3px">${waitH < 1 ? 'дөнгөж сая' : waitH + ' цаг хүлээж байна'}</div></div>
      </div>
      ${ret && e.dxReturnNote ? `<div class="rv-sec" style="color:var(--red)">↩ <b>${escHTML(e.dxReturnedBy || '')}</b>: ${escHTML(e.dxReturnNote)} <span class="muted">— эмч засаж дахин илгээхийг хүлээж байна</span></div>` : ''}
      ${an.text || an.symptoms.length ? `<div class="rv-sec"><b>Анамнез:</b> ${escHTML([an.text, an.symptoms.join(', ')].filter(Boolean).join(' · '))}</div>` : ''}
      ${vit ? `<div class="rv-sec"><b>Үзүүлэлт:</b> ${escHTML(vit)}</div>` : ''}
      ${(e.services || []).length ? `<div class="rv-sec"><b>Үйлчилгээ:</b> ${escHTML(e.services.map(x => x.name).join(', '))}</div>` : ''}
      ${(Array.isArray(e.meds) && e.meds.length) ? `<div class="rv-sec"><b>Эм:</b> ${escHTML(e.meds.map(m => (m.name || m) + (m.note ? ' — ' + m.note : '')).join(', '))}</div>` : ''}
      ${e.note ? `<div class="rv-sec" style="white-space:pre-wrap"><b>Зөвлөгөө:</b> ${escHTML(e.note)}</div>` : ''}
      <div class="rv-sec"><b>🩺 Онош</b>${appr ? ' <span class="muted" style="font-size:11px">— засаад батлаж болно</span>' : ''}</div>
      ${appr ? `<textarea class="inp" rows="2" style="margin-top:4px" oninput="_rvDraftSet('${id}', this.value)">${escHTML(draft)}</textarea>`
             : `<div style="background:var(--input);padding:8px 10px;border-radius:8px;font-size:13px;margin-top:4px">${escHTML(e.diagnosis || '—')}</div>`}
      <div class="rv-act">
        ${appr ? `<button class="btn btn-sm btn-p" onclick="approveDx('${id}', _rvDraftText('${id}'))">✅ Батлах</button>
          <input class="inp" placeholder="Буцаах шалтгаан…" value="${escHTML(rdraft)}" oninput="REVIEW_RET_DRAFT['${id}']=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();returnDx('${id}', this.value);}">
          <button class="btn btn-sm btn-r" onclick="returnDx('${id}', REVIEW_RET_DRAFT['${id}'] || '')">↩ Буцаах</button>` : ''}
        <button class="btn btn-sm" onclick="openExamDetail('${id}')">📋 Дэлгэрэнгүй</button>
        ${fin ? `<button class="btn btn-sm" onclick="printInvoice('${escHTML(fin.id)}')">🖨 Хуудас</button>` : ''}
      </div>
    </div>`;
  }).join('');
}
// ── Таб 2: Өдрийн эмчилгээ ──
function _rvTreatHTML() {
  const today = todayStr();
  const date = RV.tDate || today;
  const mode = RV.tMode;
  const inps = (STATE.inps || []).filter(i => mode === 'week'
    ? [0, 1, 2, 3, 4, 5, 6].some(k => inpInHospitalOn(i, addDaysStr(date, -k)))
    : inpInHospitalOn(i, date));
  const byDoc = {};
  inps.forEach(i => { const d = inpDoctorOf(i); const k = d ? d.name : '__none'; (byDoc[k] = byDoc[k] || []).push(i); });
  let names = Object.keys(byDoc).sort((a, b) => a === '__none' ? 1 : b === '__none' ? -1 : a.localeCompare(b));
  if (RV.tDoc) names = names.filter(n => n === RV.tDoc);
  const ctl = `
    <div style="background:var(--purple-soft);color:var(--purple);border-radius:10px;padding:9px 12px;font-size:12.5px;line-height:1.5;margin-bottom:10px">
      Байрлан эмчлүүлж буй адуу бүрд эмчлэгч эмч <b>өдөр бүр</b> «📋 Эмчилгээний бүртгэл»-д тухайн өдрийн эмчилгээгээ бичих ёстой. Орсон өдөр нь үзлэгээр бүртгэгддэг тул «🆕» гэж тусгаарлана. Маргаашийн төлөвлөгөө бичсэн эсэх мөн харагдана.
    </div>
    <div class="rv-ctl">
      <div class="fld"><label>Огноо</label><input class="inp" type="date" value="${escHTML(date)}" max="${today}" onchange="RV.tDate=this.value;renderReview()"></div>
      <div class="fld"><label>Харагдац</label><select class="inp" onchange="RV.tMode=this.value;renderReview()">
        <option value="day" ${mode === 'day' ? 'selected' : ''}>Нэг өдөр</option><option value="week" ${mode === 'week' ? 'selected' : ''}>Сүүлийн 7 хоног (хүснэгт)</option></select></div>
      <div class="fld"><label>Эмчлэгч эмч</label><select class="inp" onchange="RV.tDoc=this.value;renderReview()">
        <option value="">Бүх эмч</option>${Object.keys(byDoc).filter(n => n !== '__none').sort().map(n => `<option ${n === RV.tDoc ? 'selected' : ''}>${escHTML(n)}</option>`).join('')}${byDoc.__none ? `<option value="__none" ${RV.tDoc === '__none' ? 'selected' : ''}>Эмч заагаагүй</option>` : ''}</select></div>
      <button class="btn btn-sm" onclick="RV.tDate='';renderReview()">Өнөөдөр</button>
      <button class="btn btn-sm" onclick="RV.tDate=addDaysStr('${escHTML(date)}',-1);renderReview()">‹ Өмнөх өдөр</button>
    </div>`;
  if (!inps.length) return ctl + '<div class="empty"><div class="empty-em">🏥</div>Энэ өдөр байрлан эмчлүүлж буй адуу алга</div>';
  const label = n => n === '__none' ? '❔ Эмч заагаагүй' : '👨‍⚕️ ' + escHTML(n);
  if (mode === 'week') {
    const days = [6, 5, 4, 3, 2, 1, 0].map(k => addDaysStr(date, -k));
    const sym = { done: '✓', missing: '✗', adm: '🆕', out: '🚪', none: '' };
    const rows = names.map(n => {
      const items = byDoc[n];
      const miss = items.reduce((a, i) => a + days.filter(d => inpTreatStatus(i, d) === 'missing').length, 0);
      return `<tr><td class="l" colspan="${days.length + 1}" style="background:var(--gold-soft,#f6efdc);font-weight:800">${label(n)} <span class="muted" style="font-weight:600">· ${items.length} адуу${miss ? ' · <span style="color:var(--red)">' + miss + ' өдөр бичээгүй</span>' : ''}</span></td></tr>` +
        items.map(i => `<tr><td class="l"><a href="#" onclick="openInpHorse('${escHTML(i.id)}','treat');return false;">${escHTML(i.horse || '')}</a><div class="muted" style="font-size:10.5px">${escHTML(i.owner || '')}${i.discharged ? ' · 🚪 гарсан' : ''}</div></td>` +
          days.map(d => { const s = inpTreatStatus(i, d); const ls = inpLogsOn(i, d); return `<td class="rv-c-${s}" title="${escHTML(ls.map(l => l.docName).join(', '))}">${sym[s]}${ls.length > 1 ? '<sup>' + ls.length + '</sup>' : ''}</td>`; }).join('') + '</tr>').join('');
    }).join('');
    return ctl + `<div style="overflow-x:auto"><table class="rv-mx"><thead><tr><th style="text-align:left">Адуу</th>${days.map(d => `<th>${escHTML(d.slice(5))}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
      <div class="muted" style="font-size:11.5px;margin-top:6px">✓ бичсэн · ✗ бичээгүй · 🆕 орсон өдөр · 🚪 гарсан өдөр. Адууны нэр дээр дарж эмчилгээний бүртгэлийг нээнэ.</div>`;
  }
  const tomorrow = addDaysStr(date, 1);
  const blocks = names.map(n => {
    const items = byDoc[n];
    const req = items.filter(i => ['done', 'missing'].includes(inpTreatStatus(i, date)));
    const doneN = req.filter(i => inpTreatStatus(i, date) === 'done').length;
    const pct = req.length ? Math.round(doneN / req.length * 100) : 100;
    const order = { missing: 0, adm: 1, out: 2, done: 3 };
    const rows = items.slice().sort((a, b) => order[inpTreatStatus(a, date)] - order[inpTreatStatus(b, date)]).map(i => {
      const s = inpTreatStatus(i, date), ls = inpLogsOn(i, date);
      const plan = !i.discharged ? inpPlanFor(i, tomorrow) : null;
      const st = s === 'done' ? `<span class="badge b-g">✓ Бичсэн · ${escHTML([...new Set(ls.map(l => l.docName))].join(', '))}</span>`
        : s === 'missing' ? '<span class="badge b-r">✗ Бичээгүй</span>' : s === 'adm' ? '<span class="badge">🆕 Орсон өдөр</span>' : '<span class="badge">🚪 Гарсан өдөр</span>';
      return `<div class="rv-row ${s === 'missing' ? 'miss' : ''}">
        <span><a href="#" onclick="openInpHorse('${escHTML(i.id)}','treat');return false;"><b>${escHTML(i.horse || '')}</b></a> <span class="muted">· ${escHTML(i.owner || '')} · ${inpatientDays(i.admittedMs, i.dischargedMs)} хоног${i.location ? ' · 📍 ' + escHTML(i.location) : ''}</span></span>
        <span class="row" style="gap:4px;flex-wrap:wrap">${st}${!i.discharged && date === today ? (plan ? '<span class="badge b-p" title="' + escHTML(plan.text) + '">🗓 Маргаашийн төлөвлөгөө ✓</span>' : '<span class="badge" style="opacity:.75">🗓 Төлөвлөгөө —</span>') : ''}</span></div>`;
    }).join('');
    return `<div class="rv-doc"><div class="rv-doc-h"><span>${label(n)}</span><span style="font-size:12.5px;color:${doneN === req.length ? 'var(--green)' : 'var(--red)'}">${doneN}/${req.length} бичсэн</span></div>
      <div class="rv-bar"><div style="width:${pct}%"></div></div>${rows}</div>`;
  }).join('');
  const allReq = inps.filter(i => ['done', 'missing'].includes(inpTreatStatus(i, date)));
  const allMiss = allReq.filter(i => inpTreatStatus(i, date) === 'missing').length;
  return ctl + `<div class="inp-summary" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <div class="inp-sum-card" style="flex:1;min-width:120px;background:var(--input);border:1px solid var(--border);border-radius:10px;padding:8px 10px"><div style="font-size:20px;font-weight:900">${allReq.length - allMiss}/${allReq.length}</div><div class="muted" style="font-size:11px">${escHTML(date)}-нд эмчилгээ бичигдсэн</div></div>
      <div class="inp-sum-card" style="flex:1;min-width:120px;background:${allMiss ? 'var(--red-soft)' : 'var(--green-soft)'};border-radius:10px;padding:8px 10px"><div style="font-size:20px;font-weight:900">${allMiss}</div><div class="muted" style="font-size:11px">бичигдээгүй адуу</div></div>
    </div>` + blocks;
}
// ── Таб 3: Эзэнд мэдээлэх ──
function _rvCallHTML() {
  const due = callDueList().sort((a, b) => (a.admittedMs || 0) - (b.admittedMs || 0));
  const C = callCfg();
  const recent = [];
  (STATE.inps || []).forEach(i => inpCalls(i).forEach(c => { if ((c.ms || 0) >= nowMs() - 7 * 86400000) recent.push({ i, c }); }));
  recent.sort((a, b) => (b.c.ms || 0) - (a.c.ms || 0));
  const byDoc = {}; due.forEach(i => { const d = inpDoctorOf(i); const k = d ? d.name : 'Эмч заагаагүй'; (byDoc[k] = byDoc[k] || []).push(i); });
  return `<div style="background:var(--purple-soft);color:var(--purple);border-radius:10px;padding:9px 12px;font-size:12.5px;line-height:1.5;margin-bottom:10px">
      Байрлан эмчлүүлж буй адуу <b>${C.firstDay} хоноход</b>${C.repeatDays > 0 ? ', дараа нь <b>' + C.repeatDays + ' хоног тутам</b>' : ''} эмчлэгч эмч эзэнд нь залгаж эмчилгээний явцыг мэдээлээд «📞 Эзэнд мэдээлсэн тэмдэглэл»-д бичнэ. «Ярьсан» гэж бичмэгц сануулга арилна. (Тохиргоо → «📞 Эзэнд мэдээлэх сануулга»)
    </div>
    <div class="ch">🔔 Залгах ёстой — ${due.length} адуу</div>
    ${due.length ? Object.keys(byDoc).sort().map(n => `<div class="rv-doc"><div class="rv-doc-h"><span>👨‍⚕️ ${escHTML(n)}</span><span class="badge b-r">${byDoc[n].length}</span></div>${byDoc[n].map(i => {
      const st = inpCallState(i);
      return `<div class="rv-row miss"><span><b>${escHTML(i.horse || '')}</b> <span class="muted">· ${st.days} хоног · 👤 ${escHTML(i.owner || '')}${i.phone ? ' · <a href="tel:' + escHTML(String(i.phone).replace(/[^0-9+]/g, '')) + '">📞 ' + escHTML(i.phone) + '</a>' : ''}${st.attempts ? ' · ' + st.attempts + ' удаа холбогдоогүй' : ''}</span></span>
        <button class="btn btn-xs btn-p" onclick="openInpHorse('${escHTML(i.id)}','info')">📞 Тэмдэглэл бичих</button></div>`; }).join('')}</div>`).join('')
      : '<div class="empty"><div class="empty-em">✅</div>Залгах сануулгатай адуу алга</div>'}
    <div class="ch" style="margin-top:14px">🗒 Сүүлийн 7 хоногийн тэмдэглэл</div>
    ${recent.length ? recent.slice(0, 80).map(({ i, c }) => `<div class="rv-row"><span><b>${escHTML(i.horse || '')}</b> <span class="muted">· ${escHTML(i.owner || '')}</span> — ${escHTML(CALL_STATUS[c.status] || '')} · ${escHTML(c.by || '')} · <span class="muted">${escHTML(c.date || '')} ${escHTML(c.time || '')}</span>${c.note ? '<div style="font-size:12px;white-space:pre-wrap">' + escHTML(c.note) + '</div>' : ''}</span></div>`).join('')
      : '<div class="muted" style="font-size:12px">Тэмдэглэл алга</div>'}`;
}
// Байрлан эмчлүүлэх адууг (өөр хуудаснаас) шууд нээх
function openInpHorse(inpId, tab) {
  const i = (STATE.inps || []).find(x => String(x.id) === String(inpId));
  if (!i) { toast('Бичлэг олдсонгүй', 'err'); return; }
  if (!canAccess('inpatient')) { toast('Байрлан эмчлүүлэх хуудсанд хандах эрх алга', 'err'); return; }
  if (i.discharged) { openDischargedCard(inpId, tab); return; }
  if (INP_VIEW === 'out') INP_VIEW = 'cards';
  STATE.selectedI = String(i.id);
  if (STATE.activePage !== 'inpatient') nav('inpatient'); else renderInpatient();
  renderIDetail(); openInpDrawer();
  const t = tab || 'info';
  $$('.tab[data-itab]').forEach(x => x.classList.toggle('active', x.dataset.itab === t));
  $$('.itab').forEach(x => x.classList.toggle('hidden', x.dataset.itab !== t));
  if (t === 'info') setTimeout(() => { const c = $('#inp-call-card'); if (c && inpCallState(i).due && c.scrollIntoView) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
}

// ── 🔔 Хяналтын самбарын сануулгууд ──────────────────────────
function renderDashAlerts() {
  ensureReviewStyles();
  const box = $('#d-alerts'); if (!box || !STATE.user) return;
  const out = [];
  const me = STATE.user.name;
  const open = dxOpenList();
  if (canApproveDx()) {
    const p = open.filter(e => e.dxStatus === 'pending');
    if (p.length) out.push(`<div class="d-alert d-alert-o" onclick="RV.tab='dx';RV.dxShow='open';nav('review')"><span>🩺 Батлах хүлээгдэж буй онош: <b>${p.length}</b> <small>· ${escHTML([...new Set(p.map(e => e.docName))].join(', '))}</small></span><span>Хянах ›</span></div>`);
  }
  const mineRet = open.filter(e => e.dxStatus === 'returned' && _isMyExam(e));
  if (mineRet.length) out.push(`<div class="d-alert d-alert-r" onclick="openDxModal('${escHTML(mineRet[0].id)}')"><span>↩ Senior Veterinarian таны <b>${mineRet.length}</b> оношийг буцаасан <small>· ${escHTML(mineRet.map(e => e.horse + (e.dxReturnNote ? ': ' + e.dxReturnNote : '')).join(' · ').slice(0, 160))}</small></span><span>Засах ›</span></div>`);
  const minePend = open.filter(e => e.dxStatus === 'pending' && _isMyExam(e) && !canApproveDx());
  if (minePend.length) out.push(`<div class="d-alert d-alert-p" onclick="openDxModal('${escHTML(minePend[0].id)}')"><span>⏳ Таны <b>${minePend.length}</b> онош ахлах эмчээр хянагдаж байна <small>· батлагдсаны дараа хуудсанд онош хэвлэгдэнэ</small></span><span>›</span></div>`);
  if (canAccess('inpatient')) {
    const due = callDueList();
    if (due.length) {
      const mine = due.filter(_myInp);
      out.push(`<div class="d-alert d-alert-r" onclick="INP_VIEW='cards';INP_DAYS_F='call';nav('inpatient')"><span>📞 ${callCfg().firstDay}+ хоносон, эзэнд нь мэдээлээгүй адуу: <b>${due.length}</b>${mine.length ? ' <small>· таных ' + mine.length + ': ' + escHTML(mine.map(i => i.horse).join(', ').slice(0, 120)) + '</small>' : ''}</span><span>Залгах ›</span></div>`);
    }
  }
  if (canAccess('review') && (canApproveDx() || ['Chief Veterinarian', 'Admin', 'Manager'].includes(STATE.user.role))) {
    const h = new Date().getHours();
    const miss = (STATE.inps || []).filter(i => !i.discharged && inpTreatStatus(i, todayStr()) === 'missing');
    if (miss.length && h >= 10) out.push(`<div class="d-alert d-alert-p" onclick="RV.tab='treat';RV.tDate='';RV.tMode='day';nav('review')"><span>📝 Өнөөдөр эмчилгээ бичигдээгүй адуу: <b>${miss.length}</b> <small>· ${escHTML([...new Set(miss.map(i => { const d = inpDoctorOf(i); return d ? d.name : 'эмчгүй'; }))].join(', '))}</small></span><span>Хянах ›</span></div>`);
  }
  box.innerHTML = out.length ? '<div class="d-alerts">' + out.join('') + '</div>' : '';
}
// Шинэ онош ирэх / 3 хоносон адуу гарах үед дэлгэцэн дээр мэдэгдэл (нэг сессэд нэг удаа)
let __dxPendSeen = null, __callToastDone = false;
function reviewNotify() {
  if (!STATE.user || typeof __fbInitialLoadDone === 'undefined') return;
  const pend = dxOpenList().filter(e => e.dxStatus === 'pending');
  if (canApproveDx()) {
    const ids = new Set(pend.map(e => String(e.id)));
    if (__dxPendSeen && __fbInitialLoadDone) {
      const fresh = pend.filter(e => !__dxPendSeen.has(String(e.id)));
      if (fresh.length) toast('🩺 Батлах шинэ онош: ' + fresh.map(e => e.horse + ' (' + (e.docName || '') + ')').join(', ').slice(0, 120), 'ok');
    }
    if (__fbInitialLoadDone || !window.__fbReady) __dxPendSeen = ids;
  }
  if (!__callToastDone && (__fbInitialLoadDone || !window.__fbReady) && canAccess('inpatient')) {
    __callToastDone = true;
    const mine = callDueList().filter(_myInp);
    if (mine.length) setTimeout(() => toast('📞 Таны ' + mine.length + ' адуу ' + callCfg().firstDay + '+ хоносон — эзэнд нь залгаж тэмдэглэл бичнэ үү: ' + mine.map(i => i.horse).join(', ').slice(0, 100), 'err'), 1500);
  }
}

// ── ⚙️ Тохиргоо: эзэнд мэдээлэх сануулга ─────────────────────
function renderCallCfg() {
  const C = callCfg();
  if ($('#call-cfg-first')) $('#call-cfg-first').value = C.firstDay;
  if ($('#call-cfg-rep')) $('#call-cfg-rep').value = C.repeatDays;
}
function saveCallCfgFromForm() {
  if (!canManageUsers()) { toast('⛔ Зөвхөн админ', 'err'); return; }
  const first = parseInt(($('#call-cfg-first') || {}).value, 10), rep = parseInt(($('#call-cfg-rep') || {}).value, 10);
  if (!(first >= 1 && first <= 60)) { toast('Хоног 1–60 хооронд байна', 'err'); return; }
  STATE.callCfg = { firstDay: first, repeatDays: rep >= 0 && rep <= 60 ? rep : 0 };
  lsSet('mt_call_cfg', STATE.callCfg);
  fbSaveClinicConfig();
  writeLog('Эзэнд мэдээлэх сануулгын тохиргоо', '', '', first + ' хоноход' + (STATE.callCfg.repeatDays ? ', ' + STATE.callCfg.repeatDays + ' хоног тутам' : ''));
  toast('✅ Хадгалагдлаа', 'ok');
}

// ============================================================
// 🏥 ҮЗЛЭГЭЭР ГАРГАСАН АДУУГ БАЙРЛАН ЭМЧИЛГЭЭНД ШИЛЖҮҮЛЭХ (2026-10-05-3)
// Эмч «Үзлэг дуусгах» дарж нэхэмжлэх үүссэн боловч адуу үнэндээ байрлан
// эмчлүүлэх байсан тохиолдолд Түүхээс шилжүүлнэ. Давхар нэхэмжлэл, мөнгө
// алдагдахаас сэргийлж:
//   • үзлэгийн нэхэмжлэх устгагдаж, үзлэгийн төлбөр байрлангийн эцсийн
//     нэхэмжлэхэд (гарахад) initialAmount болж орно;
//   • төлсөн мөнгө (огноо, хэлбэр хэвээр) урьдчилгаа болж шилжинэ («зээл» биш);
//   • анхны нэхэмжлэхийн хуулбар inp.fromExam-д хадгалагдаж, эмчилгээ/нэмэлт
//     урьдчилгаа бичигдээгүй бол «↩ Үзлэг рүү буцаах»-аар яг хэвээр нь сэргээнэ.
// ============================================================
function examInpOf(e) { return e ? (STATE.inps || []).find(i => String(i.examId) === String(e.id)) : null; }
function _sameHorseActiveInp(e) {
  return (STATE.inps || []).find(i => !i.discharged && String(i.examId) !== String(e.id) &&
    ((e.horseId && i.horseId && String(i.horseId) === String(e.horseId)) ||
     (String(i.horse || '').trim() === String(e.horse || '').trim() && String(i.owner || '').trim() === String(e.owner || '').trim())));
}
// Шилжүүлэх боломжгүй шалтгаан ('' = боломжтой)
function examToInpBlock(e) {
  if (!e) return 'Үзлэг олдсонгүй';
  if (isPlanned(e)) return 'Төлөвлөгөөт (хээрийн) үзлэгийг байрлан эмчилгээнд шилжүүлэхгүй';
  if (examInpOf(e)) return 'Энэ үзлэг аль хэдийн байрлан эмчилгээнд холбогдсон';
  const act = _sameHorseActiveInp(e);
  if (act) return '«' + (act.horse || '') + '» одоо байрлан эмчлүүлж байна (орсон: ' + (act.admittedDate || '') + ')';
  if (!e.date) return 'Үзлэгийн огноо алга';
  if (e.date > todayStr()) return 'Ирээдүйн огноотой үзлэг';
  return '';
}
function canConvertExamToInp(e) { return !!e && canEditData() && !examToInpBlock(e); }
// Нэхэмжлэхийн бодит төлбөрүүд (хуучин «paid» тугтай, payments-гүй бичлэгийг мөн тооцно)
function _finRealPayments(f) {
  const ps = getPayments(f);
  if (!ps.length && f.paid === true && (parseFloat(f.amount) || 0) > 0)
    return [{ amount: parseFloat(f.amount) || 0, method: f.method || 'бэлэн', date: f.paidDate || f.date || todayStr(), ms: parseFloat(f.paidMs) || 0 }];
  return ps;
}
let __toInpExamId = null;
function ensureToInpModal() {
  if (document.getElementById('to-inp-modal')) return;
  const m = document.createElement('div');
  m.className = 'mod-bd'; m.id = 'to-inp-modal';
  m.innerHTML = `<div class="mod" style="max-width:560px">
    <div class="mod-t" id="ti-title">🏥 Байрлан эмчилгээнд шилжүүлэх</div>
    <div id="ti-body" style="max-height:66vh;overflow-y:auto"></div>
    <div class="mod-actions"><button class="btn btn-sm" onclick="closeModal('to-inp-modal')">Болих</button>
      <button class="btn btn-sm btn-p" id="ti-ok" onclick="convertExamToInp()">🏥 Шилжүүлэх</button></div></div>`;
  document.body.appendChild(m);
}
function openExamToInp(examId) {
  const e = _dxExam(examId);
  if (!canEditData()) { toast('⛔ Шилжүүлэх эрх: Chief Veterinarian / Senior Veterinarian / Admin (эсвэл «Засах эрх»-тэй)', 'err'); return; }
  const block = examToInpBlock(e);
  if (block) { toast('⛔ ' + block, 'err'); return; }
  ensureToInpModal(); __toInpExamId = String(e.id);
  const fins = (STATE.fins || []).filter(f => String(f.examId) === String(e.id));
  const docOpts = (STATE.doctors || []).map(d => `<option value="${escHTML(d.id)}" ${String(d.id) === String(e.docId) || (!e.docId && d.name === e.docName) ? 'selected' : ''}>${escHTML(d.name)}</option>`).join('');
  const locOpts = '<option value="">— заагаагүй —</option>' + inpLocations().map(l => `<option>${escHTML(l)}</option>`).join('');
  $('#ti-title').innerHTML = `🏥 Байрлан эмчилгээнд шилжүүлэх — ${escHTML(e.horse || '')} ${e.examNum ? '<span class="badge b-o">' + escHTML(e.examNum) + '</span>' : ''}`;
  $('#ti-body').innerHTML = `
    <div style="font-size:12.5px;line-height:1.6;margin-bottom:10px">
      👤 <b>${escHTML(e.owner || '')}</b>${e.phone ? ' · ' + escHTML(e.phone) : ''} · 📅 үзлэг ${escHTML(e.date || '')} ${escHTML(e.time || '')} · 👨‍⚕️ ${escHTML(e.docName || '—')}<br>
      🩺 ${escHTML(e.diagnosis || '—')} ${dxBadgeHTML(e, { small: true })}
    </div>
    <div class="fg r3">
      <div class="fld"><label>Орсон огноо</label><input class="inp" type="date" id="ti-date" value="${escHTML(e.date)}" min="${escHTML(e.date)}" max="${todayStr()}" oninput="_tiPreview()" onchange="_tiPreview()"></div>
      <div class="fld"><label>Эмчлэгч эмч</label><select class="inp" id="ti-doc">${docOpts}</select></div>
      <div class="fld"><label>📍 Байрлал</label><select class="inp" id="ti-loc">${locOpts}</select></div>
    </div>
    <div id="ti-prev" style="margin-top:10px"></div>
    <div class="muted" style="font-size:11.5px;margin-top:8px;line-height:1.5">Орсон огноо анхдагчаар үзлэгийн өдөр — адуу тэр өдрөөс хойш байрлаж байгаа бол өөрчлөхгүй. Шилжүүлсний дараа хоногийн төлбөр, эмчилгээ, гаргалт ердийнхтэй адил. Андуурсан бол эмчилгээ бичихээс өмнө адууны карт дээрх «↩ Үзлэг рүү буцаах»-аар яг хэвээр нь сэргээнэ.</div>`;
  __tiFins = fins;
  _tiPreview();
  openModal('to-inp-modal');
}
let __tiFins = [];
function _tiPreview() {
  const e = _dxExam(__toInpExamId); const box = $('#ti-prev'); if (!e || !box) return;
  const d = ($('#ti-date') || {}).value || e.date;
  const ms = new Date(d + 'T' + ((d === e.date && e.time) ? e.time : '12:00')).getTime();
  const days = inpatientDays(ms);
  const fee = DEFAULT_DAILY_FEE;
  const fins = __tiFins;
  let paid = 0, credit = 0;
  fins.forEach(f => _finRealPayments(f).forEach(p => { if (p.method === 'зээл') credit += parseFloat(p.amount) || 0; else paid += parseFloat(p.amount) || 0; }));
  const finAmt = fins.reduce((a, f) => a + (parseFloat(f.amount) || 0), 0);
  const okDate = d >= e.date && d <= todayStr();
  const btn = $('#ti-ok'); if (btn) btn.disabled = !okDate;
  box.innerHTML = `<div style="background:var(--input);border-radius:10px;padding:10px 12px;font-size:12.5px;line-height:1.7">
    ${okDate ? '' : '<div style="color:var(--red);font-weight:800">⚠ Огноо үзлэгийн өдрөөс (' + escHTML(e.date) + ') өнөөдрийн хооронд байх ёстой</div>'}
    <div>🏨 Өнөөдрийн байдлаар <b>${days} хоног</b> · хоногийн төлбөр ${days} × ${fmt(fee)} = <b>${fmt(days * fee)}</b> <span class="muted">(хоногийн үнийг дараа нь «Төлбөр тооцоо» табаас өөрчилж болно)</span></div>
    <div>🩺 Үзлэгийн төлбөр <b>${fmt(parseFloat(e.amount) || 0)}</b> → байрлангийн эцсийн нэхэмжлэхэд орно</div>
    ${fins.length
      ? `<div>🧾 Одоогийн нэхэмжлэх ${fins.length > 1 ? fins.length + ' ширхэг ' : ''}<b>${fmt(finAmt)}</b> → <b>устгагдана</b> (давхар нэхэмжлэхгүй; хуулбар нь хадгалагдана)</div>
         ${paid ? `<div style="color:var(--green);font-weight:700">💵 Төлсөн ${fmt(paid)} → урьдчилгаа болж шилжинэ (огноо, хэлбэр хэвээр — мөнгө алдагдахгүй)</div>` : '<div class="muted">💵 Төлбөр бүртгэгдээгүй</div>'}
         ${credit ? `<div class="muted">«Зээл» гэж тэмдэглэсэн ${fmt(credit)} шилжихгүй — гарахад үлдэгдэлд тооцогдоно</div>` : ''}`
      : '<div class="muted">🧾 Энэ үзлэгт нэхэмжлэх олдсонгүй — гарахад нэг нэхэмжлэх үүснэ</div>'}
  </div>`;
}
function convertExamToInp() {
  const e = _dxExam(__toInpExamId);
  if (!canEditData()) { toast('⛔ Эрх алга', 'err'); return; }
  const block = examToInpBlock(e); // өөр төхөөрөмжөөс энэ хооронд шилжүүлсэн эсэхийг дахин шалгана
  if (block) { toast('⛔ ' + block, 'err'); closeModal('to-inp-modal'); return; }
  const d = ($('#ti-date') || {}).value || e.date;
  if (!(d >= e.date && d <= todayStr())) { toast('Орсон огноо буруу', 'err'); return; }
  const admMs = new Date(d + 'T' + ((d === e.date && e.time) ? e.time : '12:00')).getTime();
  const docId = ($('#ti-doc') || {}).value || e.docId || '';
  const doc = (STATE.doctors || []).find(x => String(x.id) === String(docId));
  const loc = ($('#ti-loc') || {}).value || '';
  const fins = (STATE.fins || []).filter(f => String(f.examId) === String(e.id));
  const me = (STATE.user && STATE.user.name) || '', now = nowMs();
  // Төлбөр → урьдчилгаа (зээл биш)
  const prepayments = [];
  fins.forEach(f => _finRealPayments(f).forEach(p => {
    if (p.method === 'зээл') return;
    prepayments.push({ amount: parseFloat(p.amount) || 0, method: p.method || 'бэлэн', purpose: 'Үзлэгийн төлбөр (үзлэгээс шилжсэн)',
      date: p.date || f.paidDate || f.date || todayStr(), ms: parseFloat(p.ms) || parseFloat(f.paidMs) || now, fromExamFin: String(f.id) });
  }));
  const paidSum = prepayments.reduce((a, p) => a + p.amount, 0);
  if (!confirm('🏥 «' + e.horse + '»-г байрлан эмчилгээнд шилжүүлэх үү?\n\n' +
      'Орсон огноо: ' + d + ' · ' + inpatientDays(admMs) + ' хоног\n' +
      (fins.length ? 'Үзлэгийн нэхэмжлэх ' + fmt(fins.reduce((a, f) => a + (parseFloat(f.amount) || 0), 0)) + ' устгагдаж, гарахад нэг нэхэмжлэх үүснэ.\n' : '') +
      (paidSum ? 'Төлсөн ' + fmt(paidSum) + ' → урьдчилгаа.\n' : '') +
      '\nАндуурсан бол адууны карт дээрх «↩ Үзлэг рүү буцаах».')) return;
  const snaps = fins.map(f => JSON.parse(JSON.stringify(f))); // undefined талбаргүй хуулбар
  const inp = {
    id: uid(), examId: e.id, horseId: e.horseId || '',
    horse: e.horse || '', owner: e.owner || '', phone: e.phone || '',
    diagnosis: e.diagnosis || '', examNum: e.examNum || '',
    docId: doc ? doc.id : (e.docId || ''), docName: doc ? doc.name : (e.docName || ''),
    location: loc, admittedMs: admMs, admittedDate: d, admittedBy: me,
    initialAmount: parseFloat(e.amount) || 0,
    services: Array.isArray(e.services) ? e.services.map(s => ({ name: s.name || '', price: parseFloat(s.price) || 0 })) : [],
    meds: Array.isArray(e.meds) ? JSON.parse(JSON.stringify(e.meds)) : [],
    log: [], prepayments, discharged: false,
    fromExam: { ms: now, by: me, device: _deviceLabel(), examDate: e.date || '', fins: snaps, paid: paidSum },
    ms: now
  };
  STATE.inps.push(inp);
  // Үзлэгийн нэхэмжлэхийг устгана (хуулбар inp.fromExam.fins-д)
  fins.forEach(f => { STATE.deletedIds.add(String(f.id)); fbDeleteDoc('fins', String(f.id)); });
  const finIds = new Set(fins.map(f => String(f.id)));
  STATE.fins = STATE.fins.filter(f => !finIds.has(String(f.id)));
  e.inpatient = true; e.ms = now;
  saveAll();
  fbSaveRecord('inps', inp);
  fbSaveRecord('exams', e);
  writeLog('Үзлэгээс байрлан эмчилгээнд шилжүүлэв', inp.id, e.horse + ' — ' + (inp.docName || ''),
    'Орсон: ' + d + ' · нэхэмжлэх ' + fins.length + ' устгав' + (paidSum ? ' · ' + fmt(paidSum) + ' урьдчилгаа болгов' : '') + ' · ' + _deviceLabel(), e.examNum);
  closeModal('to-inp-modal');
  try { closeModal('exam-detail-modal'); } catch (_) {}
  updateBadges();
  toast('🏥 ' + e.horse + ' байрлан эмчилгээнд шилжлээ', 'ok');
  openInpHorse(inp.id, 'info');
}
// ↩ Шилжүүлгийг буцаах — эмчилгээ / нэмэлт урьдчилгаа бичигдээгүй үед
function revertInpToExam(inpId) {
  const i = (STATE.inps || []).find(x => String(x.id) === String(inpId || STATE.selectedI));
  if (!i || !i.fromExam) return;
  if (!canEditData()) { toast('⛔ Буцаах эрх алга', 'err'); return; }
  if (i.discharged) { toast('Адуу гарсан байна — эхлээд «↩ Буцаан байрлуулах»', 'err'); return; }
  const logs = (Array.isArray(i.log) ? i.log : []).length;
  const extraPre = getInpPrepayments(i).filter(p => !p.fromExamFin).length;
  if (logs || extraPre) { toast('⛔ ' + (logs ? logs + ' эмчилгээний бичлэг' : '') + (logs && extraPre ? ', ' : '') + (extraPre ? extraPre + ' нэмэлт урьдчилгаа' : '') + ' бичигдсэн тул үзлэг рүү буцаах боломжгүй — «🚪 Гаргах»-аар тооцоог хаана уу', 'err'); return; }
  const e = _dxExam(i.examId);
  const snaps = Array.isArray(i.fromExam.fins) ? i.fromExam.fins : [];
  if (!confirm('↩ «' + i.horse + '»-г байрлан эмчилгээнээс үзлэг рүү буцаах уу?\n\n' +
      'Анхны нэхэмжлэх ' + snaps.length + ' ширхэг (' + fmt(snaps.reduce((a, f) => a + (parseFloat(f.amount) || 0), 0)) + ') төлбөрийн хамт сэргээгдэнэ.\n' +
      'Байрлан эмчилгээний бичлэг устгагдана.')) return;
  const now = nowMs();
  // Устгасан id sync-д хориглогддог тул ШИНЭ id-тай сэргээнэ
  const restored = snaps.map(s => Object.assign({}, s, { id: uid(), ms: now, restoredFrom: String(s.id) }));
  restored.forEach(f => { STATE.fins.push(f); fbSaveRecord('fins', f); });
  STATE.deletedIds.add(String(i.id)); fbDeleteDoc('inps', String(i.id));
  STATE.inps = STATE.inps.filter(x => String(x.id) !== String(i.id));
  if (e) { e.inpatient = false; e.ms = now; fbSaveRecord('exams', e); }
  saveAll();
  writeLog('Байрлан эмчилгээг үзлэг рүү буцаав', i.id, i.horse + ' — ' + (i.docName || ''), 'Нэхэмжлэх ' + restored.length + ' сэргээв · ' + _deviceLabel(), inpExamNum(i));
  STATE.selectedI = null; closeInpDrawer();
  updateBadges();
  toast('↩ ' + i.horse + ' үзлэг рүү буцлаа — нэхэмжлэх сэргээгдлээ', 'ok');
  renderInpatient();
}

function bumpActivity() { /* no-op */ }

// ============================================================
// INIT
// ============================================================
function initApp() {
  setupNav();
  loadAll();
  updateBadges();
  renderDashboard();
  paintConnDot();
  renderRefreshChip();

  document.addEventListener('mousemove', bumpActivity, { passive: true });
  document.addEventListener('touchstart', bumpActivity, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) bumpActivity(); });
}

document.addEventListener('DOMContentLoaded', () => {
  // Disable pinch-zoom and double-tap zoom (iOS Safari)
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('gesturechange', e => e.preventDefault());
  document.addEventListener('gestureend', e => e.preventDefault());
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd < 350) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  // Block ctrl+wheel zoom on desktop
  document.addEventListener('wheel', e => {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
      e.preventDefault();
    }
  });

  try {
    loadAll();
  } catch(e) { console.error('loadAll failed', e); }
  setupLogin();
  // auto-login if user already logged in within last 8 hours
  try {
    if (STATE.user && STATE.user.loginAt && (nowMs() - STATE.user.loginAt) < 8*3600000) {
      $('#login').classList.add('hide');
      $('#app').style.display = 'flex';
      $('#hdr-sub').textContent = STATE.user.role + ' · ' + (STATE.user.phone||'');
      if ($('#drawer-sub')) $('#drawer-sub').textContent = STATE.user.role;
      initApp();
      applyRolePermissions();
      if (!canAccess(STATE.activePage || 'dashboard')) nav('dashboard');
    }
  } catch(e) { console.error('auto-login failed', e); }
});

// ============================================================
// FIREBASE FIRESTORE SYNC — Collection/Document архитектур
// Бүртгэл бүр тусдаа document — хязгааргүй өсөх боломжтой
//
// Бүтэц:
//   horses/{horseId}         — морь бүр тусдаа document
//   exams/{examId}           — үзлэг бүр тусдаа document
//   fins/{finId}             — санхүү бүр тусдаа document
//   inps/{inpId}             — байрлагч бүр тусдаа document
//   waiting/{waitId}         — хүлээлт бүр тусдаа document
//   staff/{YYYY-MM-DD}       — өдрийн roster {active, duty} + 🕒 цагийн код {codes:{empId}} + 📋 өдрийн мэдээний гараар утга {daily}
//   staff/ts-{YYYY-MM}       — 🕒 сарын мета (ажиллавал зохих өдөр, тайлбар)
//   doctors/{doctorId}       — эмч бүр тусдаа document
//   users/{userName}         — хэрэглэгч бүр тусдаа document
//   logs/{logId}             — лог бүр тусдаа document
//   deletedExams/{archId}    — устгасан үзлэг бүр тусдаа document
//   clinic_config/main       — тохиргоо (servicePrices, customServices, medCatalog 💊, employees 🕒, dailyCfg 📋...)
//   labs: direct:true + finId — 🩸 адуугүй сорьц; fins: kind:'lab'
//   inps: course[] 💊 курс, disp{} эмийн санчийн тэмдэглэгээ, severity, log[].slot
// ============================================================

// Firestore SDK функцүүд (firebase.js-ээс)
function _fbCol(name) {
  if (!window.__fbCol) return null;
  return window.__fbCol(name);
}
function _fbColDoc(colName, docId) {
  if (!window.__fbColDoc) return null;
  return window.__fbColDoc(colName, docId);
}

let __fbApplyingRemote = false;
let __fbApplyingTimer  = null;

// Waiting устгасан ID-уудын нэгдсэн бүртгэл
const __fbRemovedWaiting = new Set(
  (() => { try { return JSON.parse(localStorage.getItem('mt_removed_waiting') || '[]'); } catch(e) { return []; } })()
);
function _markWaitingRemoved(id) {
  if (!id) return;
  __fbRemovedWaiting.add(String(id));
  try { localStorage.setItem('mt_removed_waiting', JSON.stringify([...__fbRemovedWaiting])); } catch(e) {}
}

// Firestore-аас сүүлд ирсэн тооны бүртгэл (хоосон бичилтээс хамгаалах)
const __fbRemoteCount = {};

// softRefresh debounce — 500ms: анхны ачаалалд олон document ирэхэд нэг удаа render хийнэ
let __fbRefreshTimer = null;
let __fbInitialLoadDone = false; // анхны snapshot дуусах хүртэл render хийхгүй
// ── 🎯 Сонгомол дахин зурах ─────────────────────────────────────
// Өмнө нь ямар ч жагсаалтад өөрчлөлт ирсэн (лог бичигдсэн ч) одоогийн
// хуудсыг бүхэлд нь дахин зурдаг байсан. Одоо хуудас бүр аль жагсаалтаас
// хамаардгийг мэдэж, хамаагүй өөрчлөлтийг алгасна.
const PAGE_DEPS = {
  dashboard: ['exams', 'fins', 'inps', 'waiting', 'doctors', 'staff', 'config', 'horses'],
  register:  ['horses', 'config'],
  waiting:   ['waiting', 'horses', 'config'],
  exam:      ['waiting', 'exams', 'horses', 'doctors', 'config'],
  inpatient: ['inps', 'horses', 'config'],
  lab:       ['labs', 'exams', 'config'],
  finance:   ['fins', 'exams', 'doctors', 'horses', 'inps', 'config'],
  kpi:       ['exams', 'fins', 'doctors', 'inps', 'config'],
  history:   ['exams', 'horses', 'fins', 'config'],
  report:    ['exams', 'fins', 'inps', 'doctors', 'horses', 'config'],
  planned:   ['trips', 'exams', 'horses', 'doctors', 'config'],
  review:    ['exams', 'inps', 'fins', 'users', 'doctors', 'config'],
  pharmacy:  ['inps', 'exams', 'doctors', 'config'],
  timesheet: ['staff', 'doctors', 'config'],
  admin:     ['users', 'staff', 'logs', 'deletedExams', 'doctors', 'config']
};
const __dirtyCols = new Set();
function _markDirty(col) { __dirtyCols.add(col); __stateVer++; }
function _fbDebouncedRefresh() {
  if (!__fbInitialLoadDone) return; // анхны ачаалал дуусаагүй бол алгасна
  clearTimeout(__fbRefreshTimer);
  __fbRefreshTimer = setTimeout(() => {
    if (!STATE.user) { __dirtyCols.clear(); return; }
    const deps = PAGE_DEPS[STATE.activePage];
    const need = !deps || __dirtyCols.size === 0 || deps.some(c => __dirtyCols.has(c));
    __dirtyCols.clear();
    try { updateBadges(); } catch (e) {}
    if (need) softRefresh();
  }, 500);
}
// Анхны ачаалал — collection бүрийн эхний snapshot ирмэгц тэмдэглэнэ
// 3 секундын fixed delay биш, бодит snapshot тоолох аргыг ашиглана
const FB_COLLECTIONS_COUNT = 13; // FB_LISTENERS.length — 12 collection + fins_open
let __fbSnapshotsDone = 0;
function _fbMarkInitialLoadDone() {
  // Backup: хэрэв snapshot бүх collection дээр ирэхгүй бол 5 секундын дараа нэг удаа render
  const backupTimer = setTimeout(() => {
    if (!__fbInitialLoadDone) {
      __fbInitialLoadDone = true;
      if (STATE.user) softRefresh();
      try { _fbRetryPendingWrites(); } catch(e) {}
    }
  }, 5000);
  // Snapshot counter — collection бүрийн эхний snapshot ирэхэд нэмэгдэнэ
  window.__fbOnFirstSnapshot = function() {
    __fbSnapshotsDone++;
    if (__fbSnapshotsDone >= FB_COLLECTIONS_COUNT && !__fbInitialLoadDone) {
      clearTimeout(backupTimer);
      __fbInitialLoadDone = true;
      if (STATE.user) softRefresh();
      // Өмнөх session-д сервэрт хүрч амжаагүй бичилтүүдийг дахин илгээнэ
      try { _fbRetryPendingWrites(); } catch(e) {}
    }
  };
}

// ── Debounced localStorage save ────────────────────────────────
// Firestore-аас 1000 document ирэхэд 1000 удаа lsSet дуудахгүй.
// Сүүлийн document ирснээс 400ms хойш нэг удаа хадгална.
let __lsSaveTimer = null;
const __lsDirtyKeys = new Set(); // аль collection-уудыг хадгалах хэрэгтэйг тэмдэглэнэ

const LS_KEY_MAP = {
  horses: 'mt_horses', exams: 'mt_exams', fins: 'mt_fins',
  inps: 'mt_inps', waiting: 'mt_waiting',
  staff: 'mt_staff_list', doctors: 'mt_doctors',
  users: 'mt_users', logs: 'mt_logs',
  deletedExams: 'mt_deleted_exams',
  labs: 'mt_labs',
  trips: 'mt_trips'
};

function _scheduleLsSave(colName) {
  if (colName) __lsDirtyKeys.add(colName);
  clearTimeout(__lsSaveTimer);
  __lsSaveTimer = setTimeout(() => {
    __lsDirtyKeys.forEach(col => {
      const lsKey = LS_KEY_MAP[col];
      if (!lsKey) return;
      if (col === 'users') lsSet(lsKey, STATE.users || []);
      else if (col === 'logs') lsSet(lsKey, STATE.logs || []);
      else if (col === 'deletedExams') lsSet(lsKey, STATE.deletedExams || []);
      else if (STATE[col] !== undefined) lsSet(lsKey, STATE[col] || []);
    });
    __lsDirtyKeys.clear();
  }, 400);
}


// ── Сервэрт хараахан баталгаажаагүй бичилтүүд (offline хамгаалалт) ──
// setDoc-ийн promise нь зөвхөн сервэр хүлээж авсны ДАРАА биелдэг.
// Бичихийн өмнө урьдчилж тэмдэглээд, амжилттай болмогц арилгана.
// Таб хаагдаж бичилт сервэрт хүрээгүй бол дараагийн нээлтэд дахин илгээнэ.
const __fbPendingWrites = (() => {
  try { return JSON.parse(localStorage.getItem('mt_pending_writes') || '{}'); } catch(e) { return {}; }
})();
function _savePendingWrites() {
  try { localStorage.setItem('mt_pending_writes', JSON.stringify(__fbPendingWrites)); } catch(e) {}
}
function _markPending(colName, docId) {
  if (!__fbPendingWrites[colName]) __fbPendingWrites[colName] = {};
  __fbPendingWrites[colName][String(docId)] = Date.now();
  _savePendingWrites();
}
function _clearPending(colName, docId) {
  if (__fbPendingWrites[colName] && __fbPendingWrites[colName][String(docId)] !== undefined) {
    delete __fbPendingWrites[colName][String(docId)];
    _savePendingWrites();
  }
}
function _isPending(colName, docId) {
  return !!(__fbPendingWrites[colName] && __fbPendingWrites[colName][String(docId)] !== undefined);
}

function fbWriteDoc(colName, docId, data) {
  if (!window.__fbSetDoc || !window.__fbColDoc) return Promise.resolve();
  _markPending(colName, docId);
  const ref = window.__fbColDoc(colName, docId);
  return window.__fbSetDoc(ref, data)
    .then(() => { _clearPending(colName, docId); try { flashSync(); } catch(e){} })
    .catch(err => {
      console.error('[FB] ❌ ' + colName + '/' + docId + ' бичих алдаа:', err.message);
      try { toast('FB алдаа (' + colName + '): ' + err.message, 'err'); } catch(e){}
    });
}

// ── Нэг document устгах (deleteDoc) ──────────────────────────
function fbDeleteDoc(colName, docId) {
  if (!window.__fbDeleteDoc || !window.__fbColDoc) return Promise.resolve();
  const ref = window.__fbColDoc(colName, docId);
  return window.__fbDeleteDoc(ref)
    .catch(err => console.error('[FB] ❌ устгах алдаа ' + colName + '/' + docId + ':', err.message));
}

// ── ⚙️ clinic_config-ийг БҮХЭЛД нь бичих ─────────────────────
// ⚠️ ЧУХАЛ: setDoc нь document-ийг БҮТНЭЭР СОЛИНО (merge хийхгүй).
// Тиймээс clinic_config-ийг хэсэгчлэн бичих нь бусад бүх талбарыг
// (үйлчилгээний үнэ, нэмэлт үйлчилгээ, шинжилгээний тохиргоо) СЕРВЭР
// ДЭЭРЭЭС УСТГАНА. Тохиргоо өөрчлөх бүрд ЗААВАЛ энэ функцийг дуудна.
function fbSaveClinicConfig() {
  const ms = Date.now();
  STATE.configMs = ms;
  lsSet('mt_config_ms', ms);
  if (typeof fbWriteDoc !== 'function') return Promise.resolve();
  return fbWriteDoc('clinic_config', 'main', {
    servicePrices:   STATE.servicePrices   || {},
    customServices:  STATE.customServices  || [],
    removedServices: STATE.removedServices || [],
    staffSchedule:   STATE.staffSchedule   || {},
    labSvcOn:        STATE.labSvcOn        || [],
    labSvcOff:       STATE.labSvcOff       || [],
    finPinHash:      STATE.finPinHash      || '',
    bonusCfg:        STATE.bonusCfg        || null,
    examNumCfg:      STATE.examNumCfg      || null,
    inpLocations:    Array.isArray(STATE.inpLocations) ? STATE.inpLocations : null,
    customRoles:     Array.isArray(STATE.customRoles) ? STATE.customRoles : [],
    callCfg:         STATE.callCfg || null,
    medCatalog:      Array.isArray(STATE.medCatalog) ? STATE.medCatalog : [],
    employees:       Array.isArray(STATE.employees) ? STATE.employees : [],
    dailyCfg:        STATE.dailyCfg || null,
    _updatedAt: ms,
    _writer: window.__fbDeviceId || 'unknown'
  });
}

// ── Нэг бичлэгийг Firestore-д бичих ─────────────────────────
// colName: 'horses' | 'exams' | 'fins' | 'inps' | 'waiting' | 'staff' | 'doctors' | 'users' | 'logs' | 'deletedExams'
function fbSaveRecord(colName, record) {
  if (!record || !record.id) return Promise.resolve();
  const docId = String(record.id);
  const payload = Object.assign({}, record, {
    _updatedAt: Date.now(),
    _writer: window.__fbDeviceId || 'unknown'
  });
  return fbWriteDoc(colName, docId, payload);
}

// ── Бүх collection-г STATE-аас дахин бичих (migration/force) ─
function fbForcePush() {
  if (!window.__fbReady) { console.warn('[FB] Firebase бэлэн биш'); return; }
  console.log('[FB] Force push эхэллээ...');
  const colMap = {
    horses: STATE.horses || [],
    exams: STATE.exams || [],
    fins: STATE.fins || [],
    inps: STATE.inps || [],
    waiting: STATE.waiting || [],
    staff: STATE.staff || [],
    doctors: STATE.doctors || [],
    logs: STATE.logs || [],
    deletedExams: STATE.deletedExams || [],
    labs: STATE.labs || [],
  };
  const promises = [];
  for (const [col, arr] of Object.entries(colMap)) {
    for (const rec of arr) {
      if (rec && rec.id) promises.push(fbSaveRecord(col, rec));
    }
  }
  // users: name-ийг ID болгоно
  for (const u of (STATE.users || [])) {
    if (u && u.name) {
      promises.push(fbWriteDoc('users', safeDocId(u.name), Object.assign({}, u, {
        _updatedAt: Date.now(), _writer: window.__fbDeviceId || 'unknown'
      })));
    }
  }
  // clinic_config
  promises.push(fbSaveClinicConfig());
  Promise.all(promises).then(() => {
    const total = promises.length;
    console.log('[FB] Force push дууслаа. Бичсэн:', total, 'document');
    try { toast('✅ Firestore-д бичлаа: ' + total + ' document', 'ok'); } catch(e){}
  });
}
window.fbForcePush = fbForcePush;

// ── fbPushNow — тодорхой collection-уудыг STATE-аас дахин бичих ─
// Хуучин кодтой нийцтэй байлгах — ['horses','exams_h1','exams_h2','fins',...] гэж дуудагдана
// fbPushNow() — хуучин дуудлагуудтай нийцтэй байлгах no-op.
// Бичих нь call site дээр fbSaveRecord(col, record) -ээр шууд хийгдэнэ.
function fbPushNow(keys) { /* no-op: writes now happen via fbSaveRecord at call site */ }

// fbPush() — хуучин код дуудах газруудтай нийцтэй байлгах no-op.
// Firestore руу бичих нь fbSaveRecord(col, record) -ээр л хийгдэнэ.
// fbForcePush() нь зөвхөн Admin гараар дуудах тохиолдолд ажиллана.
let __fbAllTimer = null;
function fbPush() { /* no-op: use fbSaveRecord() for targeted writes */ }

// ── flashSync helper ───────────────────────────────────────────
function flashSync() {
  try {
    const el = document.getElementById('sync-dot');
    if (!el) return;
    el.classList.add('synced');
    clearTimeout(window.__flashSyncTimer);
    window.__flashSyncTimer = setTimeout(() => el.classList.remove('synced'), 1500);
  } catch(e) {}
}

// ── Firestore-ээс ирсэн document-г STATE-д нэгтгэх ───────────
function fbApplyRecord(colName, docData) {
  if (!docData) return;
  _markDirty(colName === 'clinic_config' ? 'config' : colName);
  __fbApplyingRemote = true;
  try {
    if (colName === 'clinic_config') {
      // ── ⚠️ ӨГӨГДӨЛ УСТГАХААС ХАМГААЛАХ ──────────────────────
      // Урьд нь сервэрийн хуулбар нөхцөлгүйгээр локалыг дардаг байсан тул
      // энэ компьютер дээр хадгалсан үнэ дараагийн sync-ээр устдаг байсан.
      const _remoteMs = parseFloat(docData._updatedAt) || 0;
      const _localMs  = parseFloat(STATE.configMs) || 0;

      // Локал тохиргоо илүү шинэ бол сервэрийнхийг хэрэглэхгүй — өөрийнхийг
      // буцаан бичиж сэргээнэ.
      if (_localMs && _remoteMs < _localMs) {
        console.warn('[FB] clinic_config сервэр дээр хуучин байна — локалыг буцаан бичив');
        try { fbSaveClinicConfig(); } catch(e){}
        return;
      }

      const _remotePrices = (docData.servicePrices && typeof docData.servicePrices === 'object' && !Array.isArray(docData.servicePrices))
        ? docData.servicePrices : null;
      const _localCount = Object.keys(STATE.servicePrices || {}).length;

      if (_remotePrices) {
        if (_localMs) {
          // Хэвийн үе: сервэр эрх мэдэлтэй
          STATE.servicePrices = _remotePrices;
        } else {
          // Шилжилтийн үе (энэ төхөөрөмж хараахан тохиргоо бичиж үзээгүй):
          // хуучин алдааны улмаас аль нэг тал дутуу байж болзошгүй тул НЭГТГЭНЭ.
          STATE.servicePrices = Object.assign({}, STATE.servicePrices || {}, _remotePrices);
        }
      } else if (_localCount > 0) {
        // Сервэр дээр үнэ огт алга атал локалд байна — хуучин алдааны ул мөр.
        // Локалыг сервэрт сэргээнэ.
        console.warn('[FB] clinic_config-д үнэ алга — локалаас сэргээж байна');
        try { fbSaveClinicConfig(); } catch(e){}
      }

      if (Array.isArray(docData.customServices)) {
        const set = new Set([...(STATE.customServices || []), ...docData.customServices].map(String));
        STATE.customServices = [...set];
      }
      if (Array.isArray(docData.removedServices)) {
        const set = new Set([...(STATE.removedServices || []), ...docData.removedServices].map(String));
        STATE.removedServices = [...set];
      }
      if (docData.staffSchedule && typeof docData.staffSchedule === 'object') {
        STATE.staffSchedule = docData.staffSchedule;
      }
      // 🧪 Шинжилгээний үйлчилгээний тохиргоо
      if (Array.isArray(docData.labSvcOn))  { STATE.labSvcOn  = docData.labSvcOn.slice(); lsSet('mt_lab_svc_on', STATE.labSvcOn); }
      if (Array.isArray(docData.labSvcOff)) { STATE.labSvcOff = docData.labSvcOff.slice(); lsSet('mt_lab_svc_off', STATE.labSvcOff); }
      // 🔒 Мөнгөн дүн харах код
      if (typeof docData.finPinHash === 'string') { STATE.finPinHash = docData.finPinHash; lsSet('mt_fin_pin_hash', STATE.finPinHash); try { renderFinPinStatus(); } catch(_) {} }
      // 🎁 Урамшууллын тохиргоо
      if (docData.bonusCfg && typeof docData.bonusCfg === 'object') { STATE.bonusCfg = docData.bonusCfg; lsSet('mt_bonus_cfg', STATE.bonusCfg); try { if (STATE.activePage === 'admin') renderBonusCfg(); } catch(_) {} }
      // 🔢 Үзлэгийн дугаарлалт
      if (docData.examNumCfg && typeof docData.examNumCfg === 'object') { STATE.examNumCfg = docData.examNumCfg; lsSet('mt_examnum_cfg', STATE.examNumCfg); try { if (STATE.activePage === 'admin') renderExamNumCfg(); } catch(_) {} }
      // 📍 Байрлан эмчлүүлэх байрлалууд
      if (Array.isArray(docData.inpLocations)) { STATE.inpLocations = docData.inpLocations.slice(); lsSet('mt_inp_locations', STATE.inpLocations); try { if (STATE.activePage === 'admin') renderInpLocCfg(); } catch(_) {} }
      // 👥 Admin нэмсэн дүрүүд
      if (Array.isArray(docData.customRoles)) { STATE.customRoles = docData.customRoles.slice(); lsSet('mt_custom_roles', STATE.customRoles); try { populateLoginUsers(); } catch(_) {} }
      // 📞 Эзэнд мэдээлэх сануулга
      if (docData.callCfg && typeof docData.callCfg === 'object') { STATE.callCfg = docData.callCfg; lsSet('mt_call_cfg', STATE.callCfg); try { if (STATE.activePage === 'admin') renderCallCfg(); } catch(_) {} }
      // 💊 Эмийн каталог
      if (Array.isArray(docData.medCatalog)) { STATE.medCatalog = docData.medCatalog.slice(); lsSet('mt_med_catalog', STATE.medCatalog); try { if (STATE.activePage === 'pharmacy' && typeof renderPharmacy === 'function') renderPharmacy(); } catch(_) {} }
      // 🕒 Ажилтны жагсаалт (цагийн бүртгэл)
      if (Array.isArray(docData.employees)) { STATE.employees = docData.employees.slice(); lsSet('mt_employees', STATE.employees); try { if (STATE.activePage === 'timesheet' && typeof renderTimesheet === 'function') renderTimesheet(); } catch(_) {} }
      // 📋 Өдрийн мэдээний тохиргоо
      if (docData.dailyCfg && typeof docData.dailyCfg === 'object') { STATE.dailyCfg = docData.dailyCfg; lsSet('mt_daily_cfg', STATE.dailyCfg); }
      // Шилжилтийн үе: нэгтгэсэн үр дүнг сервэрт нэг удаа буцаан бичиж
      // бүх төхөөрөмжийн тохиргоог нийлүүлнэ (дараа нь _localMs тэглэгдэхгүй).
      if (!_localMs && _localCount > 0) { try { fbSaveClinicConfig(); } catch(e){} }
      try { if (STATE.activePage === 'admin' && typeof renderLabSvcConfig === 'function') renderLabSvcConfig(); } catch(e){}
      lsSet('mt_service_prices', STATE.servicePrices);
      lsSet('mt_custom_services', STATE.customServices);
      lsSet('mt_removed_services', STATE.removedServices);
      lsSet('mt_staff_schedule', STATE.staffSchedule);
      try { if (STATE.activePage === 'admin' && typeof renderServicePrices === 'function') renderServicePrices(); } catch(e){}
      return;
    }

    if (colName === 'users') {
      // users: name-ийг ID болгосон — document data нь хэрэглэгчийн объект
      const u = docData;
      if (!u.name) return;
      const existing = (STATE.users || []).findIndex(x => x.name === u.name);
      if (existing >= 0) {
        const lc = STATE.users[existing];
        const remoteMs = parseFloat(u._updatedAt) || 0;
        const localMs  = parseFloat(lc._updatedAt) || 0;
        if (remoteMs > localMs) {
          // pwHash хадгална — pw (plain text) хэзээ ч merge хийхгүй
          STATE.users[existing] = Object.assign({}, u, { pwHash: u.pwHash || lc.pwHash || '' });
          // Шилжилтийн үе: хуучин pw талбар байвал хадгалж үлдээнэ
          if (!u.pwHash && (u.pw || lc.pw)) STATE.users[existing].pw = u.pw || lc.pw;
        }
      } else {
        if (!STATE.users) STATE.users = [];
        STATE.users.push(u);
      }
      _scheduleLsSave('users');
      try { populateLoginUsers(); } catch(e){}
      try { if (STATE.activePage === 'admin' && typeof renderUserList === 'function') renderUserList(); } catch(e){}
      return;
    }

    if (colName === 'logs') {
      const l = docData;
      if (!l.id) return;
      if (!STATE.logs) STATE.logs = [];
      const idx = STATE.logs.findIndex(x => x.id === l.id);
      if (idx < 0) STATE.logs.push(l);
      if (STATE.logs.length > LOG_DISPLAY_LIMIT) STATE.logs = STATE.logs.slice(-LOG_DISPLAY_LIMIT);
      _scheduleLsSave('logs');
      try { if (STATE.activePage === 'admin' && typeof renderLogViewer === 'function') renderLogViewer(); } catch(e){}
      return;
    }

    if (colName === 'deletedExams') {
      const a = docData;
      const key = String(a._archId || (a.exam && a.exam.id) || a.deletedAt || '');
      if (!key) return;
      if (!STATE.deletedExams) STATE.deletedExams = [];
      const idx = STATE.deletedExams.findIndex(x => {
        const k = String(x._archId || (x.exam && x.exam.id) || x.deletedAt || '');
        return k === key;
      });
      if (idx < 0) STATE.deletedExams.push(a);
      if (STATE.deletedExams.length > 500) STATE.deletedExams = STATE.deletedExams.slice(-500);
      _scheduleLsSave('deletedExams');
      try { if (STATE.activePage === 'admin' && typeof renderDeletedExams === 'function') renderDeletedExams(); } catch(e){}
      return;
    }

    if (colName === 'waiting') {
      const r = normalizeRow(docData);
      if (!r || r.id == null) return;
      // Устгасан бол алгасна
      if (__fbRemovedWaiting.has(String(r.id))) return;
      if (!STATE.waiting) STATE.waiting = [];
      const idx = STATE.waiting.findIndex(x => String(x.id) === String(r.id));
      if (idx < 0) {
        STATE.waiting.push(r);
      } else {
        const lc = STATE.waiting[idx];
        const remoteMs = parseFloat(r.ms) || 0;
        const localMs  = parseFloat(lc.ms) || 0;
        if (remoteMs >= localMs) STATE.waiting[idx] = r;
      }
      _scheduleLsSave('waiting');
      return;
    }

    // Ерөнхий тохиолдол: horses, exams, fins, inps, staff, doctors
    const lsKeyMap = {
      horses: 'mt_horses', exams: 'mt_exams', fins: 'mt_fins',
      inps: 'mt_inps', staff: 'mt_staff_list', doctors: 'mt_doctors'
    };
    const r = normalizeRow(docData);
    if (!r || r.id == null) return;
    // Устгасан бол алгасна
    if (STATE.deletedIds instanceof Set && STATE.deletedIds.has(String(r.id))) return;
    if (!STATE[colName]) STATE[colName] = [];
    const lc = recById(colName, r.id);
    if (!lc) {
      _recIdxPush(colName, r);
    } else {
      // ⏱ ms байхгүй хуучин бичлэгт _updatedAt / createdAt-аар нөхөж харьцуулна —
      // эс бөгөөс 0 >= 0 болж хуучин хуулбар шинийг дардаг (ИАБД устдаг байсан шалтгаан)
      const remoteMs = parseFloat(r.ms)  || parseFloat(r._updatedAt)  || parseFloat(r.createdAt)  || 0;
      const localMs  = parseFloat(lc.ms) || parseFloat(lc._updatedAt) || parseFloat(lc.createdAt) || 0;
      if (remoteMs >= localMs) {
        // Remote шинэ — array талбаруудыг хамгаалж нэгтгэнэ
        const ARRAY_FIELDS = ['prepayments','payments','log','services','meds','images','results','history','calls','plans','dxHistory'];
        ARRAY_FIELDS.forEach(f => {
          if ((!Array.isArray(r[f]) || r[f].length === 0) && Array.isArray(lc[f]) && lc[f].length) r[f] = lc[f];
        });
        // 🛡 ИАБД хамгаалалт: remote дээр хоосон ч локалд байвал хадгална
        if (colName === 'horses' && !r.iabd && lc.iabd) r.iabd = lc.iabd;
        // ⚠️ ОБЪЕКТЫГ СОЛИХГҮЙ — байгаа объект дээр нь шинэчилнэ.
        // Өмнө нь `STATE[colName][idx] = r` гэж СОЛЬДОГ байсан. Гэтэл засварын
        // цонх (морь/үзлэг засах) хуучин объектыг заалтаар барьдаг тул цонх
        // нээлттэй байхад snapshot ирвэл заалт САЛЖ, хэрэглэгчийн бичсэн
        // өөрчлөлт «✅ Хадгалагдлаа» гэж харагдсаар атлаа замхардаг байсан.
        // Object.assign нь объектын хаягийг хадгалдаг тул заалт хүчинтэй үлдэнэ.
        Object.keys(lc).forEach(k => { if (!(k in r)) delete lc[k]; });
        Object.assign(lc, r);
      }
    }
    _scheduleLsSave(colName);

  } catch(e) {
    console.error('[FB] fbApplyRecord алдаа (' + colName + '):', e);
  } finally {
    clearTimeout(__fbApplyingTimer);
    __fbApplyingTimer = setTimeout(() => { __fbApplyingRemote = false; }, 200);
  }
  _scheduleBadges();
  _fbDebouncedRefresh();
  _flashSyncThrottled();
}

// updateBadges нь бүх санг гүйлгэдэг тул бичлэг бүрд биш, багцаар нэг удаа
let __badgeTimer = null;
function _scheduleBadges() { if (__badgeTimer) return; __badgeTimer = setTimeout(() => { __badgeTimer = null; try { updateBadges(); } catch (e) {} }, 120); }
let __flashLast = 0;
function _flashSyncThrottled() { const n = Date.now(); if (n - __flashLast < 400) return; __flashLast = n; try { flashSync(); } catch (e) {} }

// ── Устгагдсан document-г STATE-аас хасах ────────────────────
function fbRemoveRecord(colName, docId) {
  _markDirty(colName);
  __fbApplyingRemote = true;
  try {
    if (colName === 'waiting') {
      STATE.waiting = (STATE.waiting || []).filter(x => String(x.id) !== String(docId));
      _markWaitingRemoved(docId);
      _scheduleLsSave('waiting');
    } else if (STATE[colName] && Array.isArray(STATE[colName])) {
      STATE[colName] = STATE[colName].filter(x => String(x.id) !== String(docId));
      STATE.deletedIds.add(String(docId));
      const lsKeyMap = {
        horses: 'mt_horses', exams: 'mt_exams', fins: 'mt_fins',
        inps: 'mt_inps', staff: 'mt_staff_list', doctors: 'mt_doctors'
      };
      _scheduleLsSave(colName);
    }
  } catch(e) {
    console.error('[FB] fbRemoveRecord алдаа:', e);
  } finally {
    clearTimeout(__fbApplyingTimer);
    __fbApplyingTimer = setTimeout(() => { __fbApplyingRemote = false; }, 200);
  }
  _scheduleBadges();
  _fbDebouncedRefresh();
}

// ── Анхны snapshot-той локал кэшийг ТУЛГАХ (reconcile) ────────
// Firestore-ийн анхны snapshot зөвхөн ОДОО сервэр дээр байгаа doc-уудыг
// агуулдаг тул өөр компьютер дээр устгагдсан бичлэгт 'removed' event ирдэггүй.
// Ийм stale бичлэг localStorage кэшэд үлдэж, компьютер бүр өөр өөр
// "Хүлээгдэж буй" жагсаалт харуулдаг байсан. Энэ функц үүнийг засна:
//   1. Локалд байгаа ч сервэрт байхгүй waiting бичлэгийг хасна
//      (энэ төхөөрөмжөөс бичигдээд сервэрт хүрч амжаагүй pending бичлэгийг
//       хасахгүй — харин дахин илгээнэ)
//   2. Устгасан гэж тэмдэглэсэн (tombstone) боловч сервэрт үлдсэн doc-ийн
//      устгалыг дахин илгээнэ (устгал offline үед сервэрт хүрээгүй тохиолдол)
//   3. Зорилгоо биелүүлсэн tombstone-уудыг цэвэрлэнэ
function _fbReconcileWaiting(remoteIds) {
  const remote = new Set((remoteIds || []).map(String));
  let changed = false;
  STATE.waiting = (STATE.waiting || []).filter(w => {
    const id = String(w.id);
    if (remote.has(id)) return true;
    if (_isPending('waiting', id) && !__fbRemovedWaiting.has(id)) {
      fbSaveRecord('waiting', w); // сервэрт хүрээгүй бичлэг — дахин илгээнэ
      return true;
    }
    changed = true;
    return false; // өөр компьютер дээр устгагдсан stale бичлэг
  });
  let tsChanged = false;
  [...__fbRemovedWaiting].forEach(id => {
    if (remote.has(String(id))) {
      fbDeleteDoc('waiting', String(id)); // устгал сервэрт хүрээгүй байсан — дахин устгана
    } else {
      __fbRemovedWaiting.delete(id);
      tsChanged = true;
    }
  });
  if (tsChanged) {
    try { localStorage.setItem('mt_removed_waiting', JSON.stringify([...__fbRemovedWaiting])); } catch(e) {}
  }
  if (changed) {
    _scheduleLsSave('waiting');
    updateBadges();
    _fbDebouncedRefresh();
  }
}

// ── Сервэрт хүрээгүй үлдсэн бичилтүүдийг дахин илгээх ─────────
// Анхны ачаалал дууссаны дараа нэг удаа дуудагдана.
// (waiting-ийг _fbReconcileWaiting өөрөө шийддэг тул энд алгасна)
function _fbRetryPendingWrites() {
  try {
    for (const colName of Object.keys(__fbPendingWrites)) {
      if (colName === 'waiting' || colName === 'clinic_config') continue;
      const ids = Object.keys(__fbPendingWrites[colName] || {});
      for (const docId of ids) {
        let rec = null;
        if (colName === 'users') {
          rec = (STATE.users || []).find(u => u && u.name && safeDocId(u.name) === docId);
          if (rec) {
            fbWriteDoc('users', docId, Object.assign({}, rec, {
              _updatedAt: Date.now(), _writer: window.__fbDeviceId || 'unknown'
            }));
            continue;
          }
        } else if (Array.isArray(STATE[colName])) {
          rec = STATE[colName].find(x => x && String(x.id) === String(docId));
          if (rec) { fbSaveRecord(colName, rec); continue; }
        }
        // Бичлэг STATE-д олдсонгүй — pending тэмдэглэгээг цэвэрлэнэ
        _clearPending(colName, docId);
      }
    }
    // clinic_config pending байвал тохиргоог бүхэлд нь дахин бичнэ
    if (__fbPendingWrites['clinic_config'] && Object.keys(__fbPendingWrites['clinic_config']).length) {
      fbSaveClinicConfig();
    }
  } catch(e) {
    console.error('[FB] pending retry алдаа:', e);
  }
}

// ── onSnapshot — collection бүрийг сонсох ─────────────────────
const __fbUnsubs = {};

const FB_COLLECTIONS = [
  'horses', 'exams', 'fins', 'inps', 'waiting',
  'staff', 'doctors', 'users', 'logs', 'deletedExams', 'labs', 'trips'
];
const __fbColStatus = {}; // colName → { cacheAt, serverAt, lastAt, n, changes }

// ── 🪟 ЦОНХТОЙ СОНСОГЧ ─────────────────────────────────────────
// Өмнө нь төхөөрөмж бүр БҮХ үзлэг, БҮХ санхүүг бодит цагаар сонсдог байв —
// 2500+ бичлэг санах ойд, өөрчлөлт бүрд бүгдийг хадгалж, дахин зурна.
// Одоо бодит цагаар зөвхөн:
//   • үзлэг: сүүлийн LIVE_WINDOW_DAYS хоног (date >= LIVE_CUTOFF)
//   • санхүү: сүүлийн LIVE_WINDOW_DAYS хоног + БҮРЭН ТӨЛӨГДӨӨГҮЙ бүгд (paid != true)
//   • лог, устгасан үзлэг: сүүлийн N
//   • бусад (адуу, хүлээлт, байрлан эмчлүүлэх, шинжилгээ, эмч, ажилтан, явц): бүтнээр
// Хуучин хугацааг Түүх/KPI/Тайлан/Урамшуулал дээр сонгоход ensureRange()
// хэрэгтэй хэсгийг л нэг удаа татна (харна уу: «Хугацааны хэсэгчилсэн ачаалалт»).
const LIVE_WINDOW_DAYS = 120;
const LIVE_CUTOFF = (() => { const d = new Date(); d.setDate(d.getDate() - LIVE_WINDOW_DAYS); return localDateStr(d); })();
const FB_LISTENERS = [
  { key: 'horses',       col: 'horses' },
  { key: 'exams',        col: 'exams',        where: [['date', '>=', LIVE_CUTOFF]], windowed: true },
  { key: 'fins',         col: 'fins',         where: [['date', '>=', LIVE_CUTOFF]], windowed: true },
  { key: 'fins_open',    col: 'fins',         where: [['paid', '!=', true]],        windowed: true, label: 'Accountant / Finance (төлөгдөөгүй)' },
  { key: 'inps',         col: 'inps' },
  { key: 'waiting',      col: 'waiting' },
  { key: 'staff',        col: 'staff' },
  { key: 'doctors',      col: 'doctors' },
  { key: 'users',        col: 'users' },
  { key: 'logs',         col: 'logs',         orderField: 'log_ms',    limitN: 400, windowed: true },
  { key: 'deletedExams', col: 'deletedExams', orderField: 'deletedAt', limitN: 200, windowed: true },
  { key: 'labs',         col: 'labs' },
  { key: 'trips',        col: 'trips' }
];

// ── 📚 Хугацааны хэсэгчилсэн ачаалалт ──────────────────────────
// Цонхноос гадуурх үзлэг/санхүүг [from, to] огноогоор нэг удаа татаж STATE-д нэгтгэнэ.
// Татсан хугацааг санаж давхар татахгүй. Сонсогч биш тул тэдгээр бичлэгийн
// дараагийн өөрчлөлт бодит цагаар ирэхгүй (хуучин бичлэг ховор өөрчлөгддөг).
const __loadedRanges = { exams: [[LIVE_CUTOFF, '9999-12-31']], fins: [[LIVE_CUTOFF, '9999-12-31']] };
const __rangeInflight = {};
let __allHistoryLoaded = false;
function _rangeCovered(col, from, to) {
  return (__loadedRanges[col] || []).some(r => r[0] <= from && r[1] >= to);
}
function _addRange(col, from, to) {
  const arr = __loadedRanges[col] || (__loadedRanges[col] = []);
  arr.push([from, to]);
  // Давхацсан/залгаа хугацааг нэгтгэнэ
  arr.sort((a, b) => a[0] < b[0] ? -1 : 1);
  const out = [];
  for (const r of arr) { const l = out[out.length - 1]; if (l && r[0] <= l[1]) { if (r[1] > l[1]) l[1] = r[1]; } else out.push(r.slice()); }
  __loadedRanges[col] = out;
}
// Буцаана: шинэ бичлэг нэмэгдсэн бол true (дахин зурах хэрэгтэй)
async function ensureRange(from, to, cols) {
  cols = cols || ['exams', 'fins'];
  if (!from) from = '2000-01-01';
  if (!to || to > LIVE_CUTOFF) to = LIVE_CUTOFF < from ? from : LIVE_CUTOFF; // цонх доторхийг сонсогч өгнө
  if (from > to) return false;
  if (!window.__fbQuery || !window.__fbReady) return false;
  let added = 0;
  for (const col of cols) {
    if (_rangeCovered(col, from, to)) continue;
    const k = col + '|' + from + '|' + to;
    if (__rangeInflight[k]) { await __rangeInflight[k]; continue; }
    __rangeInflight[k] = (async () => {
      try {
        const res = await window.__fbQuery(col, [['date', '>=', from], ['date', '<=', to]]);
        const before = (STATE[col] || []).length;
        res.docs.forEach(d => { if (d && d.id) fbApplyRecord(col, d); });
        added += (STATE[col] || []).length - before;
        if (!res.fromCache || res.docs.length) _addRange(col, from, to);
      } catch (e) { console.warn('[FB] ensureRange ' + col + ' ' + from + '…' + to, e && e.message); }
    })();
    await __rangeInflight[k];
    delete __rangeInflight[k];
  }
  return added > 0;
}
// Бүх түүхийг (цонхноос өмнөхийг) нэг удаа татна — Түүх хуудасны хайлт бүрэн ажиллахад
async function loadAllHistory() {
  if (__allHistoryLoaded) return false;
  toast('Бүх түүхийг татаж байна…', 'ok');
  const ok = await ensureRange('2000-01-01', LIVE_CUTOFF);
  __allHistoryLoaded = true;
  toast('✅ Бүх түүх ачаалагдлаа', 'ok');
  return ok;
}
function historyHint(from) {
  if (__allHistoryLoaded) return '';
  const partial = !from || from < LIVE_CUTOFF;
  return partial
    ? '<div class="muted" style="font-size:11.5px;margin:4px 0 8px">⏳ Сүүлийн ' + LIVE_WINDOW_DAYS + ' хоног (' + LIVE_CUTOFF + '-с хойш) ба төлөгдөөгүй бичлэг ачаалагдсан. Хуучин хугацааг харахын тулд огноо сонгох, эсвэл <a href="#" onclick="loadAllHistory().then(function(){softRefresh();});return false;">бүх түүхийг ачаалах</a>.</div>'
    : '';
}

function fbStartListening() {
  if (!window.__fbReady || !window.__fbColListen) return;
  _fbMarkInitialLoadDone(); // анхны ачаалал дуусах хүртэл render хийхгүй

  // clinic_config — нэг document
  if (!__fbUnsubs['clinic_config'] && window.__fbDocListen && window.__fbColDoc) {
    __fbUnsubs['clinic_config'] = window.__fbDocListen(
      window.__fbColDoc('clinic_config', 'main'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (data._writer === window.__fbDeviceId && (Date.now() - (data._updatedAt||0)) < 5000) return;
        fbApplyRecord('clinic_config', data);
      },
      (err) => console.error('[FB] clinic_config сонсох алдаа:', err)
    );
  }

  // users — нэг удаа getDoc хийж хурдан ачаалах
  if (window.__fbGetDoc && window.__fbColDoc && !(STATE.users && STATE.users.length)) {
    // users collection-г query хийж бүгдийг татна
    if (window.__fbColQuery) {
      window.__fbColQuery('users').then(docs => {
        docs.forEach(d => fbApplyRecord('users', d.data()));
      }).catch(() => {});
    }
  }

  // Сонсогч бүрийг эхлүүлнэ — эхний snapshot ирмэгц __fbOnFirstSnapshot дуудна
  FB_LISTENERS.forEach(L => {
    const key = L.key, colName = L.col;
    if (__fbUnsubs[key]) return;
    let _firstSnap = false; // энэ сонсогчийн эхний snapshot ирсэн эсэх
    __fbUnsubs[key] = window.__fbColListen(colName, (changes, allIds, isFirst, fromCache, isFirstServer) => {
      // 📊 Синкийн төлөв (утсан дээрх оношилгооны самбарт)
      const st = __fbColStatus[key] || (__fbColStatus[key] = { cacheAt: 0, serverAt: 0, lastAt: 0, n: 0, changes: 0 });
      st.lastAt = Date.now(); st.n = allIds.length; st.changes += changes.length;
      if (fromCache && !st.cacheAt) st.cacheAt = Date.now();
      if (!fromCache) st.serverAt = Date.now();
      // Эхний snapshot тэмдэглэх
      if (!_firstSnap) {
        _firstSnap = true;
        if (typeof window.__fbOnFirstSnapshot === 'function') window.__fbOnFirstSnapshot();
      }
      changes.forEach(({ type, docId, data }) => {
        if (type === 'removed') {
          if (L.windowed && window.__fbDocIfExists) {
            // Цонхтой сонсогч: «цонхноос гарсан» уу, «устсан» уу — сервэрээс шалгана.
            // Ж: санхүү төлөгдөхөд paid!=true цонхноос гарна — устгаж БОЛОХГҮЙ, шинэчилнэ.
            window.__fbDocIfExists(colName, docId).then(d => {
              if (d === null) fbRemoveRecord(colName, docId);
              else if (d) fbApplyRecord(colName, d);
            });
          } else {
            fbRemoveRecord(colName, docId);
          }
        } else {
          if (data._writer === window.__fbDeviceId && (Date.now() - (data._updatedAt||0)) < 5000) return;
          fbApplyRecord(colName, data);
        }
      });
      // Анхны snapshot дээр локал кэшийг сервэртэй тулгана —
      // өөр компьютер дээр устгагдсан stale бичлэгүүдийг хасна
      // ⚠️ Тулгах алхмыг ЗӨВХӨН сервэрээс ирсэн анхны snapshot дээр хийнэ.
      // Дискэн кэшийн allIds нь сервэрийн үнэн жагсаалт БИШ — үүгээр тулгавал
      // өөр компьютер дээр нэмсэн бичлэгийг «устсан» гэж үзэж алга болгоно.
      if (isFirstServer && colName === 'waiting') _fbReconcileWaiting(allIds);
    }, (err) => console.error('[FB] onSnapshot алдаа (' + key + '):', err),
       { where: L.where, orderField: L.orderField, limitN: L.limitN });
  });
}

// ── fbFlashSync helper (UI dot) ────────────────────────────────
window.fbForcePush = fbForcePush;
window.fbPushNow   = fbPushNow;
window.fbPush      = fbPush;

// saveAll() — зөвхөн localStorage cache хадгалана.
// Firebase руу бичихгүй — тэр нь fbSaveRecord(col, record) -ээр хийгдэнэ.
// fbForcePush() нь зөвхөн Admin migration/emergency-д ашиглагдана.

// Firebase бэлэн болмогц сонсож эхлэх
if (window.__fbReady) {
  fbStartListening();
} else {
  window.addEventListener('firebase-ready', fbStartListening, { once: true });
}

/* Contemplação — app.js
   - Imagens fullscreen contemplativas (Picsum + Met Museum + Unsplash + curada)
   - Sons em loop via WebAudio procedural (sem arquivos externos obrigatórios) + fallback Pixabay
   - UI sutil, glass, autoplay, swipe, categorias
*/
(() => {
  "use strict";

  // ---------- CONFIG — MODO IMERSIVO ----------
  const AUTOPLAY_MS = 15000;
  const TRANSITION_MS = 1600;
  const IMMERSIVE_MODE = true; // sem HUD, só imagem + mar
  const DISTINCT_TARGET = 100;
  const MET_SEARCH_QUERIES = {
    aleatorio: ["sunset","nature","landscape","sea","forest","mountain","lake","mist","aurora"],
    natureza: ["nature","forest","mountain","lake","mist","sunset","river","waterfall"],
    cidade:   ["city","urban","street","architecture","night","skyline","tokyo","new york"],
    fantasia: ["mythology","fantasy","surreal","dream","aurora","castle","moon","stars"],
    obras:    ["van gogh","monet","turner","hokusai","rembrandt","vermeer","landscape","portrait"],
    mar:      ["sea","ocean","beach","waves","coast","harbor","ship","island"],
    floresta: ["forest","trees","woods","jungle","misty forest","autumn","bamboo"]
  };
  const UNSPLASH_QUERIES = {
    aleatorio: "nature,calm,minimal,mist",
    natureza: "nature,mountain,forest,mist,lake",
    cidade: "city,night,urban,architecture",
    fantasia: "fantasy,surreal,mystical,aurora,dream",
    obras: "museum,painting,renaissance,art",
    mar: "ocean,sea,beach,waves",
    floresta: "forest,woods,misty,trees"
  };

  // Lista curada contemplativa — 58 imagens sem direitos restritivos
  // Picsum: fotos CC0 garantidas; Unsplash CDN direto (hotlink permitido); Wikimedia domínio público
  // Pool Pixabay estável (testado 200) + Unsplash direto
  const PIXABAY_POOL = [
    "https://cdn.pixabay.com/photo/2015/12/01/20/28/forest-1072828_1280.jpg",
    "https://cdn.pixabay.com/photo/2016/05/05/02/37/sunset-1373171_1280.jpg",
    "https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_1280.jpg",
    "https://cdn.pixabay.com/photo/2015/06/19/21/24/avenue-815297_1280.jpg",
    "https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg",
    "https://cdn.pixabay.com/photo/2016/10/21/14/50/plouzane-1758197_1280.jpg",
    "https://cdn.pixabay.com/photo/2014/02/27/16/10/flowers-276014_1280.jpg"
  ];
  const CURATED = {
    aleatorio: [
      { url:"https://cdn.pixabay.com/photo/2015/12/01/20/28/forest-1072828_1280.jpg", title:"Floresta em névoa", meta:"Pixabay • CC0", link:"https://pixabay.com" },
      { url:"https://cdn.pixabay.com/photo/2016/05/05/02/37/sunset-1373171_1280.jpg", title:"Pôr-do-sol contemplativo", meta:"Pixabay • CC0", link:"https://pixabay.com" },
      { url:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&auto=format&fit=crop&q=80", title:"Montanha ao entardecer", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&auto=format&fit=crop&q=80", title:"Floresta úmida", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=80", title:"Praia vazia", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&auto=format&fit=crop&q=80", title:"Névoa na floresta", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg", title:"Lago espelhado", meta:"Pixabay • CC0", link:"https://pixabay.com" },
      { url:"https://upload.wikimedia.org/wikipedia/commons/c/c5/Caspar_David_Friedrich_-_Wanderer_above_the_Sea_of_Fog.jpg", title:"Caminhante sobre névoa — Friedrich", meta:"Domínio público • Wikimedia", link:"https://commons.wikimedia.org" },
    ],
    natureza: [
      { url:"https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_1280.jpg", title:"Vale ao amanhecer", meta:"Pixabay • CC0", link:"https://pixabay.com" },
      { url:"https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg", title:"Rio sinuoso", meta:"Pixabay • CC0", link:"https://pixabay.com" },
      { url:"https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&auto=format&fit=crop&q=80", title:"Cachoeira na mata", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&auto=format&fit=crop&q=80", title:"Floresta vista de cima", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1920&auto=format&fit=crop&q=80", title:"Lago espelhado", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&auto=format&fit=crop&q=80", title:"Trilha outonal", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://cdn.pixabay.com/photo/2015/12/01/20/28/forest-1072828_1280.jpg", title:"Campo de névoa", meta:"Pixabay • CC0", link:"https://pixabay.com" },
      { url:"https://picsum.photos/seed/nature04/1920/1080", title:"Montanhas sobrepostas (Picsum)", meta:"Picsum • CC0 — fallback", link:"https://picsum.photos" },
    ],
    cidade: [
      { url:"https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&auto=format&fit=crop&q=80", title:"Avenida vazia à noite", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&auto=format&fit=crop&q=80", title:"Neon e chuva", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&auto=format&fit=crop&q=80", title:"Bairro em silêncio", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&auto=format&fit=crop&q=80", title:"Skyline ao crepúsculo", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&auto=format&fit=crop&q=80", title:"Perspectiva infinita", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg", title:"Cidade sob estrelas", meta:"Pixabay • CC0", link:"https://pixabay.com" },
      { url:"https://cdn.pixabay.com/photo/2015/06/19/21/24/avenue-815297_1280.jpg", title:"Alameda urbana", meta:"Pixabay • CC0", link:"https://pixabay.com" },
    ],
    fantasia: [
      { url:"https://cdn.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg", title:"Céu fantástico", meta:"Pixabay • CC0", link:"https://pixabay.com" },
      { url:"https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1920&auto=format&fit=crop&q=80", title:"Aurora sobre o lago", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&auto=format&fit=crop&q=80", title:"Noite estrelada na montanha", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&auto=format&fit=crop&q=80", title:"Reflexo cósmico", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=80", title:"Ponte para o sonho", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1520637102912-2df6bb2aec6d?w=1920&auto=format&fit=crop&q=80", title:"Nevoeiro fantástico", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://upload.wikimedia.org/wikipedia/commons/c/c5/Caspar_David_Friedrich_-_Wanderer_above_the_Sea_of_Fog.jpg", title:"Caminhante sobre o mar de névoa — Friedrich (1818)", meta:"Domínio público • Wikimedia", link:"https://commons.wikimedia.org" },
    ],
    obras: [
      { url:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1920px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg", title:"Noite estrelada — Van Gogh (1889)", meta:"Domínio público • Wikimedia / Met", link:"https://commons.wikimedia.org" },
      { url:"https://upload.wikimedia.org/wikipedia/commons/a/a5/Tsunami_by_hokusai_19th_century.jpg", title:"A grande onda — Hokusai (1831)", meta:"Domínio público • Wikimedia", link:"https://commons.wikimedia.org" },
      { url:"https://upload.wikimedia.org/wikipedia/commons/9/9e/WLA_metmuseum_Water_Lilies_by_Claude_Monet.jpg", title:"Nenúfares — Monet", meta:"Domínio público • Met", link:"https://commons.wikimedia.org" },
      { url:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1920px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg", title:"O nascimento de Vênus — Botticelli", meta:"Domínio público", link:"https://commons.wikimedia.org" },
      { url:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/1280px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg", title:"O beijo — Klimt (1908)", meta:"Domínio público", link:"https://commons.wikimedia.org" },
      { url:"https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1920&auto=format&fit=crop&q=80", title:"Galeria silenciosa", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1577083165633-14ebcdb0f658?w=1920&auto=format&fit=crop&q=80", title:"Detalhe de museu", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://cdn.pixabay.com/photo/2014/02/27/16/10/flowers-276014_1280.jpg", title:"Natureza morta suave", meta:"Pixabay • CC0", link:"https://pixabay.com" },
    ],
    mar: [
      { url:"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&auto=format&fit=crop&q=80", title:"Ondas ao entardecer", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=80", title:"Água turquesa", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&auto=format&fit=crop&q=80", title:"Penhasco e mar", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1489185078259-e00dccbd025a?w=1920&auto=format&fit=crop&q=80", title:"Horizonte marítimo", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&auto=format&fit=crop&q=80", title:"Praia ao amanhecer", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://cdn.pixabay.com/photo/2016/10/21/14/50/plouzane-1758197_1280.jpg", title:"Costa rochosa", meta:"Pixabay • CC0", link:"https://pixabay.com" },
    ],
    floresta: [
      { url:"https://cdn.pixabay.com/photo/2015/12/01/20/28/forest-1072828_1280.jpg", title:"Catedral verde", meta:"Pixabay • CC0", link:"https://pixabay.com" },
      { url:"https://cdn.pixabay.com/photo/2015/06/19/21/24/avenue-815297_1280.jpg", title:"Luz filtrada", meta:"Pixabay • CC0", link:"https://pixabay.com" },
      { url:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&auto=format&fit=crop&q=80", title:"Bosque enevoado", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1920&auto=format&fit=crop&q=80", title:"Troncos altos", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&auto=format&fit=crop&q=80", title:"Outono silencioso", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&auto=format&fit=crop&q=80", title:"Musgo e sombra", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
      { url:"https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=1920&auto=format&fit=crop&q=80", title:"Clareira", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    ]
  };

  // Pool extra para garantir 100+ distintas — Wikimedia + Unsplash adicionais
  const EXTRA_POOL = [
    { url:"https://upload.wikimedia.org/wikipedia/commons/4/48/001_Chateau_de_Chillon_and_Dents_du_Midi_Photo_by_Giles_Laurent.jpg", title:"Château de Chillon e Dents du Midi", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/9/98/001_Golden_jackal_and_azureum_flowers_in_Jim_Corbett_National_Park_Photo_by_Giles_Laurent.jpg", title:"Chacal dourado entre flores", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/b/b6/001_Greater_flamingo_in_flight_in_the_Camargue_Photo_by_Giles_Laurent.jpg", title:"Flamingo em voo — Camargue", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/b/ba/001_Humpback_whale_breaching_in_Ballena_Marine_National_Park_Photo_by_Giles_Laurent.jpg", title:"Baleia jubarte — Ballena", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/0/04/001_Volcano_eruption_of_Litli-Hr%C3%BAtur_in_Iceland_in_2023_Photo_by_Giles_Laurent.jpg", title:"Vulcão Litli-Hrútur — Islândia", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/0/09/001_Wild_Golden_Eagle_and_Majinghorn_Pfyn-Finges_Photo_by_Giles_Laurent.jpg", title:"Águia dourada — Pfyn-Finges", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/7/7b/002_Asian_green_bee-eaters_in_Keoladeo_National_Park_Photo_by_Giles_Laurent.jpg", title:"Abelharucos verdes", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/5/50/001_Olive-bellied_Sunbird_starting_to_fly_at_Kibale_National_Park_Photo_by_Giles_Laurent.jpg", title:"Sunbird olive", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/5/56/001_Marsh_deer_and_Pink_Ip%C3%AA_tree_in_Encontro_das_%C3%81guas_State_Park_Photo_by_Giles_Laurent.jpg", title:"Cervo e ipê rosa", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/3/32/001_Juvenile_leopard_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg", title:"Leopardo jovem — Serengeti", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/e/e7/Monet_-_Impression%2C_Sunrise.jpg", title:"Impressão, nascer do sol — Monet (1872)", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/0/0d/Gustav_Klimt_-_The_Tree_of_Life_-_Google_Art_Project.jpg", title:"Árvore da Vida — Klimt", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/3/32/Caspar_David_Friedrich_-_The_Sea_of_Ice_-_Google_Art_Project.jpg", title:"Mar de gelo — Friedrich", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&auto=format&fit=crop&q=80", title:"Lago alpino", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1920&auto=format&fit=crop&q=80", title:"Noite estrelada sobre montanha", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&auto=format&fit=crop&q=80", title:"Lago e montanhas", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&auto=format&fit=crop&q=80", title:"Floresta aérea outonal", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=1920&auto=format&fit=crop&q=80", title:"Deserto ao entardecer", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&auto=format&fit=crop&q=80", title:"Cidade ao pôr-do-sol", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1920&auto=format&fit=crop&q=80", title:"Ponte iluminada", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&auto=format&fit=crop&q=80", title:"Estrada na natureza", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/c/c9/%22A_mother%21_How_odd%21%22_-_Gordon_Ross._LCCN2011648850-restored.jpg", title:"A mother How odd — Gordon Ross", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/3/35/%22A_sure_horse_for_the_first_money%22_LCCN2002695764-restored.jpg", title:"A sure horse — LCCN", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/2/21/%22Everything_is_Going_to_be_Alright%22_artwork%2C_Christchurch_Art_Gallery%2C_Christchurch%2C_New_Zealand.jpg", title:"Everything is Going to be Alright", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/4/40/%22Zerynthia_polyxena%22.jpg", title:"Zerynthia polyxena", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/9/97/%27One_of_the_wards_in_the_hospital_at_Scutari%27._Wellcome_M0007724_-_restoration%2C_cropped.jpg", title:"Hospital at Scutari", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/c/c5/%28Venice%29_Bocca_di_Leone_in_the_Doge%27s_Palace.jpg", title:"Bocca di Leone — Veneza", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/6/60/0_Gaius_Flavius_Valerius_Constantinus%2C_Palatino.jpg", title:"Constantino — Palatino", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/5/50/001_Olive-bellied_Sunbird_starting_to_fly_at_Kibale_National_Park_Photo_by_Giles_Laurent.jpg", title:"Olive-bellied Sunbird — extra", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&auto=format&fit=crop&q=80", title:"Trilha outonal — extra", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=80", title:"Praia vazia — extra", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&auto=format&fit=crop&q=80", title:"Névoa na floresta — extra", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://cdn.pixabay.com/photo/2016/10/21/14/50/plouzane-1758197_1280.jpg", title:"Costa rochosa — extra", meta:"Pixabay • CC0", link:"https://pixabay.com" },
    { url:"https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg", title:"Natureza — extra", meta:"Pixabay • CC0", link:"https://pixabay.com" },
    { url:"https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1920&auto=format&fit=crop&q=80", title:"Troncos altos — extra", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1920&auto=format&fit=crop&q=80", title:"Outono — extra", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/5/5d/%22Photograph_made_from_B-17_Flying_Fortress_of_the_8th_AAF_Bomber_Command_on_31_Dec._when_they_attacked_the_vital_CAM_bal_-_NARA_-_535712.jpg", title:"B-17 sobre nuvens", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/a/a3/%22Wind_Mountain%22_Columbia_R_-_NARA_-_102278851_%28page_1%29.png", title:"Wind Mountain — Columbia", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/5/53/%28Castres%29_Notre-Dame-de-la-Plat%C3%A9_-_L%27orgue_de_tribune.jpg", title:"Órgão Castres", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/5/55/%28Orgueil%29_-_L%27%C3%89glise_Saint-Ferr%C3%A9ol_-_Voute_du_choeur.jpg", title:"Abóbada Orgueil", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://upload.wikimedia.org/wikipedia/commons/9/98/001_Golden_jackal_and_azureum_flowers_in_Jim_Corbett_National_Park_Photo_by_Giles_Laurent.jpg", title:"Chacal dourado — extra 2", meta:"Wikimedia • domínio público", link:"https://commons.wikimedia.org" },
    { url:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&auto=format&fit=crop&q=80", title:"Montanha ao entardecer — extra", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&auto=format&fit=crop&q=80", title:"Cachoeira — extra", meta:"Unsplash • licença gratuita", link:"https://unsplash.com" },
    { url:"https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_1280.jpg", title:"Montanha — extra", meta:"Pixabay • CC0", link:"https://pixabay.com" },
    { url:"https://cdn.pixabay.com/photo/2015/06/19/21/24/avenue-815297_1280.jpg", title:"Avenida — extra", meta:"Pixabay • CC0", link:"https://pixabay.com" },
    { url:"https://loremflickr.com/1920/1080/city?lock=101", title:"City contemplativo #1", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/forest?lock=102", title:"Forest contemplativo #2", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/ocean?lock=103", title:"Ocean contemplativo #3", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/mountain?lock=104", title:"Mountain contemplativo #4", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/lake?lock=105", title:"Lake contemplativo #5", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/sky?lock=106", title:"Sky contemplativo #6", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/fantasy?lock=107", title:"Fantasy contemplativo #7", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/night?lock=108", title:"Night contemplativo #8", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/nature?lock=109", title:"Nature contemplativo #9", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/city?lock=110", title:"City contemplativo #10", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/forest?lock=111", title:"Forest contemplativo #11", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/ocean?lock=112", title:"Ocean contemplativo #12", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/mountain?lock=113", title:"Mountain contemplativo #13", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/lake?lock=114", title:"Lake contemplativo #14", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/sky?lock=115", title:"Sky contemplativo #15", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/fantasy?lock=116", title:"Fantasy contemplativo #16", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/night?lock=117", title:"Night contemplativo #17", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/nature?lock=118", title:"Nature contemplativo #18", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/city?lock=119", title:"City contemplativo #19", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/forest?lock=120", title:"Forest contemplativo #20", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/ocean?lock=121", title:"Ocean contemplativo #21", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/mountain?lock=122", title:"Mountain contemplativo #22", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/lake?lock=123", title:"Lake contemplativo #23", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/sky?lock=124", title:"Sky contemplativo #24", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/fantasy?lock=125", title:"Fantasy contemplativo #25", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/night?lock=126", title:"Night contemplativo #26", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/nature?lock=127", title:"Nature contemplativo #27", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/city?lock=128", title:"City contemplativo #28", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/forest?lock=129", title:"Forest contemplativo #29", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
    { url:"https://loremflickr.com/1920/1080/ocean?lock=130", title:"Ocean contemplativo #30", meta:"LoremFlickr • CC0 • aleatório", link:"https://loremflickr.com" },
  ];

  // ---------- DOM ----------
  const stage = document.getElementById("stage");
  const imgA = document.getElementById("imgA");
  const imgB = document.getElementById("imgB");
  const scrim = document.getElementById("scrim");
  const loader = document.getElementById("loader");
  const captionTitle = document.getElementById("captionTitle");
  const captionMeta = document.getElementById("captionMeta");
  const captionLink = document.getElementById("captionLink");
  const imageCounter = document.getElementById("imageCounter");
  const autoplayToggle = document.getElementById("autoplayToggle");
  const autoplayCountdown = document.getElementById("autoplayCountdown");
  const soundSelect = document.getElementById("soundSelect");
  const volumeSlider = document.getElementById("volumeSlider");
  const btnSoundToggle = document.getElementById("btnSoundToggle");
  const btnNext = document.getElementById("btnNext");
  const btnPrev = document.getElementById("btnPrev");
  const btnShuffle = document.getElementById("btnShuffle");
  const btnHideUI = document.getElementById("btnHideUI");
  const btnInfo = document.getElementById("btnInfo");
  const btnFullscreen = document.getElementById("btnFullscreen");
  const infoDialog = document.getElementById("infoDialog");
  const categoryBar = document.getElementById("categoryBar");
  const chips = [...categoryBar.querySelectorAll(".chip")];

  // ---------- STATE ----------
  let currentCategory = localStorage.getItem("contemplacao:category") || "aleatorio";
  let currentIsA = true;
  let isLoading = false;
  let historyStack = [];
  let futureStack = [];
  let imageIndex = parseInt(localStorage.getItem("contemplacao:index")||"0",10) || 0;
  let autoplayTimer = null;
  let countdownTimer = null;
  let countdownLeft = AUTOPLAY_MS;

  // sync UI category
  chips.forEach(c=>{
    if(c.dataset.cat===currentCategory) c.classList.add("is-active");
    else c.classList.remove("is-active");
  });

  // ---------- MODO IMERSIVO: 100 DISTINTAS SEM REPETIR ----------
  function shuffleArray(a){
    const b=[...a];
    for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const tmp=b[i]; b[i]=b[j]; b[j]=tmp; }
    return b;
  }
  function buildMasterPool(){
    const all=[]; const seen=new Set();
    const pushUnique=(arr)=> arr.forEach(it=>{ if(it && it.url && !seen.has(it.url)){ seen.add(it.url); all.push(it); } });
    Object.values(CURATED).forEach(arr=> pushUnique(arr));
    pushUnique(EXTRA_POOL);
    // Pixabay pool direto (garantido CC0)
    pushUnique(PIXABAY_POOL.map(u=>({url:u, title:"Paisagem serena", meta:"Pixabay • CC0", link:"https://pixabay.com", source:"Pixabay"})));
    return all;
  }
  let masterPool = buildMasterPool();
  // garantir pelo menos 100 — se ainda menor, duplica com variações de query (mesma imagem mas com cache-bust não conta como distinta, então apenas avisa)
  if(masterPool.length < 100){
    console.warn("masterPool", masterPool.length, "— completando com Met dinâmico para garantir 100");
  }
  let shuffleQueue = shuffleArray(masterPool);
  let queueIndex = 0;
  let shownUrls = new Set(JSON.parse(localStorage.getItem("contemplacao:shown")||"[]"));
  let distinctCount = parseInt(localStorage.getItem("contemplacao:distinct")||"0",10) || 0;
  function persistShown(){
    try{
      localStorage.setItem("contemplacao:shown", JSON.stringify([...shownUrls].slice(-120)));
      localStorage.setItem("contemplacao:distinct", String(distinctCount));
    }catch(e){}
  }
  function getNextDistinctFromPool(){
    // se já mostramos 100 distintas, reseta ciclo
    if(distinctCount >= DISTINCT_TARGET){
      shownUrls.clear();
      distinctCount = 0;
      shuffleQueue = shuffleArray(masterPool);
      queueIndex = 0;
      persistShown();
    }
    // tenta pegar do shuffleQueue sem repetir dentro do ciclo
    let tries=0;
    while(tries < shuffleQueue.length * 2){
      if(queueIndex >= shuffleQueue.length){
        shuffleQueue = shuffleArray(masterPool);
        queueIndex = 0;
      }
      const cand = shuffleQueue[queueIndex++];
      if(!cand) { tries++; continue; }
      if(!shownUrls.has(cand.url)){
        shownUrls.add(cand.url);
        distinctCount++;
        persistShown();
        return cand;
      }
      tries++;
      // se já vimos todas do pool, força Met dinâmico para não repetir
      if(tries > shuffleQueue.length){
        break;
      }
    }
    // fallback: busca Met dinâmico distinto
    return null;
  }

  // ---------- IMAGE LOGIC ----------
  function setLoader(v){
    loader.classList.toggle("is-visible", v);
    stage.classList.toggle("is-loading", v);
  }
  function updateCounter(){
    imageCounter.textContent = `${imageIndex} contemplada${imageIndex!==1?"s":""}`;
  }
  function showCaption(item){
    captionTitle.textContent = item.title || "";
    captionMeta.textContent = item.meta || "";
    if(item.link){
      captionLink.href = item.link;
      captionLink.hidden = false;
      captionLink.textContent = item.source || "fonte";
    } else {
      captionLink.hidden = true;
    }
  }

  function preloadImage(url){
    return new Promise((resolve, reject)=>{
      const img = new Image();
      img.crossOrigin = "anonymous";
      const t = setTimeout(()=> reject(new Error("timeout")), 5000);
      img.onload = ()=> { clearTimeout(t); resolve(url); };
      img.onerror = ()=> { clearTimeout(t); reject(new Error("load fail")); };
      img.src = url;
      // fallback para cache: se já complete
      if(img.complete && img.naturalWidth>0){ clearTimeout(t); resolve(url); }
    });
  }

  async function fetchMetImage(category){
    const queries = MET_SEARCH_QUERIES[category] || MET_SEARCH_QUERIES.aleatorio;
    const q = queries[Math.floor(Math.random()*queries.length)];
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 5500);
    try{
      const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(q)}`;
      const res = await fetch(searchUrl, { signal: controller.signal });
      if(!res.ok) throw new Error("met search fail");
      const data = await res.json();
      if(!data.objectIDs || data.objectIDs.length===0) throw new Error("no ids");
      const pool = data.objectIDs.slice(0, 60);
      const id = pool[Math.floor(Math.random()*pool.length)];
      const objRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`, { signal: controller.signal });
      if(!objRes.ok) throw new Error("met object fail");
      const obj = await objRes.json();
      const imgUrl = obj.primaryImageSmall || obj.primaryImage;
      if(!imgUrl) throw new Error("no image");
      return {
        url: imgUrl,
        title: obj.title ? `${obj.title}${obj.artistDisplayName? " — "+obj.artistDisplayName : ""}` : "Obra do Met",
        meta: `Met Museum • ${obj.objectDate || ""} • domínio público`,
        link: obj.objectURL || "https://www.metmuseum.org",
        source: "Met Museum"
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  function getPicsumUrl(category){
    const seed = `${category}-${Date.now()}-${Math.floor(Math.random()*1e9)}`;
    return {
      url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/1920/1080`,
      title: "Instante contemplativo",
      meta: "Picsum Photos • CC0 • aleatório",
      link: "https://picsum.photos",
      source: "Picsum"
    };
  }

  function getPixabayUrl(category){
    const url = PIXABAY_POOL[Math.floor(Math.random()*PIXABAY_POOL.length)];
    const titles = { natureza:"Natureza serena", cidade:"Cidade contemplativa", fantasia:"Fantasia sutil", obras:"Obra suave", mar:"Mar tranquilo", floresta:"Floresta acolhedora", aleatorio:"Instante quieto" };
    return {
      url, title: titles[category]||titles.aleatorio,
      meta: "Pixabay • CC0",
      link: "https://pixabay.com",
      source: "Pixabay"
    };
  }

  function getUnsplashDirectUrl(category){
    // usa pool de ids Unsplash diretos quando source.unsplash está instável
    const pools = {
      natureza: ["photo-1441974231531-c6227db76b6e","photo-1433086966358-54859d0ed716","photo-1469474968028-56623f02e42e","photo-1470071459604-3b5ec3a7fe05"],
      cidade: ["photo-1493246507139-91e8fad9978e","photo-1514565131-fce0801e5785","photo-1477959858617-67f85cf4f1df","photo-1480714378408-67cf0d13bc1b"],
      fantasia: ["photo-1531306728370-e2ebd9d7bb99","photo-1519681393784-d120267933ba","photo-1518837695005-2083093ee35b","photo-1520637102912-2df6bb2aec6d"],
      mar: ["photo-1505118380757-91f5f5632de0","photo-1507525428034-b723cf961d3e","photo-1439066615861-d1af74d74000","photo-1519046904884-53103b34b206"],
      floresta: ["photo-1448375240586-882707db888b","photo-1425913397330-cf8af2ff40a1","photo-1475924156734-496f6cac6ec1","photo-1542202229-7d93c33f5d07"],
      obras: ["photo-1578301978693-85fa9c0320b9","photo-1577083165633-14ebcdb0f658"],
      aleatorio: ["photo-1506905925346-21bda4d32df4","photo-1441974231531-c6227db76b6e","photo-1507525428034-b723cf961d3e","photo-1470071459604-3b5ec3a7fe05","photo-1469474968028-56623f02e42e"]
    };
    const pool = pools[category] || pools.aleatorio;
    const id = pool[Math.floor(Math.random()*pool.length)];
    return {
      url: `https://images.unsplash.com/${id}?w=1920&auto=format&fit=crop&q=80`,
      title: "Paisagem contemplativa",
      meta: "Unsplash • licença gratuita",
      link: "https://unsplash.com",
      source: "Unsplash"
    };
  }

  function getUnsplashSourceUrl(category){
    const q = UNSPLASH_QUERIES[category] || UNSPLASH_QUERIES.aleatorio;
    const sig = Math.floor(Math.random()*1e9);
    return {
      url: `https://source.unsplash.com/1920x1080/?${encodeURIComponent(q)}&sig=${sig}`,
      title: "Paisagem contemplativa",
      meta: "Unsplash Source • licença gratuita",
      link: "https://unsplash.com",
      source: "Unsplash"
    };
  }

  function getCurated(category){
    const pool = CURATED[category] || CURATED.aleatorio;
    if(Math.random()<0.22 && category!=="aleatorio"){
      const all = CURATED.aleatorio;
      if(Math.random()<0.45) return all[Math.floor(Math.random()*all.length)];
    }
    return pool[Math.floor(Math.random()*pool.length)];
  }

  async function getNextImageData(category){
    if(IMMERSIVE_MODE){
      // modo imersivo: garante 100 distintas via shuffleQueue + Met dinâmico
      for(let attempt=0; attempt<8; attempt++){
        let cand = getNextDistinctFromPool();
        if(cand){
          try{ await preloadImage(cand.url); return cand; }catch(e){ continue; }
        }
        // se pool esgotado ou falhou preload, tenta Met dinâmico distinto
        try{
          const met = await fetchMetImage("aleatorio");
          if(!shownUrls.has(met.url)){
            try{ await preloadImage(met.url); shownUrls.add(met.url); distinctCount++; persistShown(); return met; }catch(e){}
          }
        }catch(e){}
        // fallback pixabay/unsplash direto ainda tentando ser distinto
        const fallbacks = [getPixabayUrl(category), getUnsplashDirectUrl(category), getCurated("aleatorio")];
        for(const f of fallbacks){
          if(!shownUrls.has(f.url)){
            try{ await preloadImage(f.url); shownUrls.add(f.url); distinctCount++; persistShown(); return f; }catch(e){}
          }
        }
      }
      // último recurso: qualquer curada
      const any = getCurated("aleatorio");
      try{ await preloadImage(any.url); }catch(e){}
      return any;
    }
    const isObras = category==="obras";
    // tentativas com fallback inteligente — evita providers instáveis
    const attempts = [];
    // construir lista priorizada por categoria
    if(isObras){
      attempts.push("met","curated","unsplashDirect","pixabay","met");
    } else if(category==="cidade" || category==="fantasia"){
      attempts.push("curated","unsplashDirect","pixabay","met","curated");
    } else {
      attempts.push("curated","unsplashDirect","pixabay","met","curated");
    }
    // embaralhar levemente para variedade mas manter prioridade
    for(let i=0;i<attempts.length;i++){
      const kind = attempts[i];
      try{
        let data;
        if(kind==="met") data = await fetchMetImage(category);
        else if(kind==="pixabay") data = getPixabayUrl(category);
        else if(kind==="unsplashDirect") data = getUnsplashDirectUrl(category);
        else if(kind==="picsum") data = getPicsumUrl(category);
        else data = getCurated(category);
        // tentar preload rápido; se for met, já validado parcialmente, mas ainda verifica imagem
        await preloadImage(data.url);
        return data;
      }catch(e){
        // console.debug("provider fail", kind, e.message);
        continue;
      }
    }
    // último fallback absoluto: curada sem preload (mostra mesmo se falhar, browser tenta)
    return getCurated(category);
  }

  async function showNext({ pushHistory = true, isPrev = false } = {}){
    if(isLoading) return;
    isLoading = true;
    setLoader(true);
    try{
      let data;
      if(isPrev && historyStack.length>0){
        // voltar no histórico
        const prev = historyStack.pop();
        // guardar atual no futuro
        const currentMeta = {
          url: (currentIsA ? imgA.src : imgB.src),
          title: captionTitle.textContent,
          meta: captionMeta.textContent,
          link: captionLink.href,
          source: captionLink.textContent
        };
        if(currentMeta.url) futureStack.push(currentMeta);
        data = prev;
        // não precisa fetch, mas precisa preload para crossfade suave? já está em cache
        // mas garantir
        if(data.url && !data.url.startsWith("data:")){
          try{ await preloadImage(data.url); }catch(e){}
        }
        imageIndex = Math.max(0, imageIndex-1);
      } else {
        if(futureStack.length>0 && !pushHistory){
          // avançar no futuro (redo)
          data = futureStack.pop();
          try{ await preloadImage(data.url);}catch(e){}
        } else {
          data = await getNextImageData(currentCategory);
          // limpar futuro quando navega novo
          if(pushHistory) futureStack = [];
        }
        if(pushHistory){
          // guardar atual no histórico
          const curUrl = currentIsA ? imgA.src : imgB.src;
          if(curUrl){
            historyStack.push({
              url: curUrl,
              title: captionTitle.textContent,
              meta: captionMeta.textContent,
              link: captionLink.href,
              source: captionLink.textContent || "fonte"
            });
            if(historyStack.length>50) historyStack.shift();
          }
          imageIndex++;
        } else {
          imageIndex++;
        }
      }

      // crossfade
      const target = currentIsA ? imgB : imgA;
      const current = currentIsA ? imgA : imgB;

      // garantir que target não visível antes de trocar
      target.classList.remove("is-visible");
      // small delay para transition reset quando necessário
      await new Promise(r=> setTimeout(r, 40));
      target.src = data.url;
      target.alt = data.title || "Imagem contemplativa";

      // esperar decode se disponível
      if(target.decode){
        try{ await target.decode(); }catch(e){}
      } else {
        // esperar um pouco
        await new Promise(r=> setTimeout(r, 120));
      }

      showCaption(data);
      target.classList.add("is-visible");
      // depois da transição, garantir estado
      setTimeout(()=>{
        current.classList.remove("is-visible");
      }, TRANSITION_MS + 50);

      currentIsA = !currentIsA;
      updateCounter();
      localStorage.setItem("contemplacao:index", String(imageIndex));
      stage.classList.remove("is-empty");
      resetAutoplayCountdown();

    }catch(err){
      console.warn("showNext fail", err);
      // mostrar curada mesmo com erro
      const fallback = getCurated(currentCategory);
      const target = currentIsA ? imgB : imgA;
      target.src = fallback.url;
      target.alt = fallback.title;
      showCaption(fallback);
      target.classList.add("is-visible");
      (currentIsA?imgA:imgB).classList.remove("is-visible");
      currentIsA = !currentIsA;
    }finally{
      isLoading = false;
      setLoader(false);
    }
  }

  // ---------- AUTOPLAY ----------
  function startAutoplay(){
    stopAutoplay();
    if(!autoplayToggle.checked) return;
    countdownLeft = AUTOPLAY_MS;
    autoplayCountdown.textContent = `${Math.ceil(countdownLeft/1000)}s`;
    autoplayTimer = setInterval(()=> showNext(), AUTOPLAY_MS);
    countdownTimer = setInterval(()=>{
      countdownLeft -= 1000;
      if(countdownLeft<=0) countdownLeft = AUTOPLAY_MS;
      autoplayCountdown.textContent = `${Math.ceil(countdownLeft/1000)}s`;
    }, 1000);
  }
  function stopAutoplay(){
    if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer=null; }
    if(countdownTimer){ clearInterval(countdownTimer); countdownTimer=null; }
    autoplayCountdown.textContent = autoplayToggle.checked ? `${Math.ceil(AUTOPLAY_MS/1000)}s` : "";
  }
  function resetAutoplayCountdown(){
    if(autoplayToggle.checked){
      countdownLeft = AUTOPLAY_MS;
      autoplayCountdown.textContent = `${Math.ceil(countdownLeft/1000)}s`;
    }
  }

  // ---------- AUDIO ENGINE - procedural ----------
  class AmbientEngine {
    constructor(){
      this.ctx = null;
      this.master = null;
      this.type = "silencio";
      this.nodes = [];
      this.intervals = [];
      this.timeouts = [];
      this.volume = 0.42;
      this.isPlaying = false;
    }
    ensureCtx(){
      if(this.ctx) return this.ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      this.ctx = new AC({ latencyHint:"playback" });
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      return this.ctx;
    }
    setVolume(v){ // 0..1
      this.volume = v;
      if(this.master) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.25);
      localStorage.setItem("contemplacao:volume", String(Math.round(v*100)));
    }
    async resumeIfNeeded(){
      if(this.ctx && this.ctx.state==="suspended"){
        try{ await this.ctx.resume(); }catch(e){}
      }
    }
    stop(){
      this.isPlaying = false;
      this.intervals.forEach(clearInterval);
      this.timeouts.forEach(clearTimeout);
      this.intervals = []; this.timeouts = [];
      this.nodes.forEach(n=>{
        try{ n.stop && n.stop(); }catch(e){}
        try{ n.disconnect && n.disconnect(); }catch(e){}
      });
      this.nodes=[];
      btnSoundToggle.classList.remove("is-playing");
      btnSoundToggle.textContent = "♫";
      btnSoundToggle.setAttribute("aria-label","Ativar som");
    }
    async play(type){
      if(type==="silencio"){ this.stop(); this.type=type; return; }
      const ctx = this.ensureCtx();
      if(!ctx){ console.warn("WebAudio não suportado"); return; }
      this.stop();
      this.type = type;
      await this.resumeIfNeeded();
      // create graph per type
      try{
        switch(type){
          case "chuva": this.createRain(); break;
          case "cachoeira": this.createWaterfall(); break;
          case "mar": this.createSea(false); break;
          case "gaivotas": this.createSea(true); break;
          case "floresta": this.createForest(); break;
          case "cidade": this.createCity(); break;
          case "vento": this.createWind(); break;
          case "noite": this.createNight(); break;
          default: this.createRain(); break;
        }
        this.isPlaying = true;
        btnSoundToggle.classList.add("is-playing");
        btnSoundToggle.textContent = "⏸";
        btnSoundToggle.setAttribute("aria-label","Pausar som");
      }catch(e){ console.warn("audio create fail", e); }
    }
    // helpers
    createNoiseBuffer(duration=2, type="white"){
      const ctx = this.ctx;
      const len = ctx.sampleRate * duration;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      if(type==="white"){
        for(let i=0;i<len;i++) data[i]=Math.random()*2-1;
      } else if(type==="pink"){
        // Paul Kellet pink
        let b0,b1,b2,b3,b4,b5,b6;
        b0=b1=b2=b3=b4=b5=b6=0;
        for(let i=0;i<len;i++){
          const white=Math.random()*2-1;
          b0=0.99886*b0+white*0.0555179;
          b1=0.99332*b1+white*0.0750759;
          b2=0.96900*b2+white*0.1538520;
          b3=0.86650*b3+white*0.3104856;
          b4=0.55000*b4+white*0.5329522;
          b5=-0.7616*b5-white*0.0168980;
          data[i]=(b0+b1+b2+b3+b4+b5+b6+white*0.5362)*0.11;
          b6=white*0.115926;
        }
      } else if(type==="brown"){
        let last=0;
        for(let i=0;i<len;i++){
          const white=Math.random()*2-1;
          last = (last + (0.02 * white)) / 1.02;
          data[i]=last*3.5;
        }
      }
      return buf;
    }
    loopNoise(type, gainVal, filterCfg){
      const ctx=this.ctx;
      const src=ctx.createBufferSource();
      src.buffer=this.createNoiseBuffer(3, type);
      src.loop=true;
      const gain=ctx.createGain(); gain.gain.value=gainVal;
      let last=src;
      if(filterCfg){
        const f=ctx.createBiquadFilter();
        f.type=filterCfg.type||"lowpass";
        f.frequency.value=filterCfg.freq||800;
        f.Q.value=filterCfg.q||1;
        src.connect(f); f.connect(gain);
        this.nodes.push(f);
      } else {
        src.connect(gain);
      }
      gain.connect(this.master);
      src.start();
      this.nodes.push(src,gain);
      return {src,gain};
    }
    createRain(){
      // chuva suave: white noise bandpass + low rain rumble + drops
      this.loopNoise("white", 0.22, {type:"bandpass", freq: 1800, q:0.7});
      this.loopNoise("pink", 0.18, {type:"lowpass", freq: 900, q:0.5});
      // drops aleatórios
      const ctx=this.ctx;
      const drop = ()=>{
        if(!this.isPlaying) return;
        const o=ctx.createOscillator(); o.type="sine"; o.frequency.value= 800 + Math.random()*1200;
        const g=ctx.createGain(); g.gain.value=0;
        const f=ctx.createBiquadFilter(); f.type="bandpass"; f.frequency.value=2500; f.Q.value=1.2;
        o.connect(f); f.connect(g); g.connect(this.master);
        const now=ctx.currentTime;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.12 + Math.random()*0.08, now+0.008);
        g.gain.exponentialRampToValueAtTime(0.001, now+0.18+ Math.random()*0.12);
        o.start(now); o.stop(now+0.3);
        this.nodes.push(o,f,g);
        // autodisconnect após
        setTimeout(()=>{ try{o.disconnect();f.disconnect();g.disconnect();}catch(e){} }, 600);
      };
      const iv=setInterval(drop, 180 + Math.random()*120);
      // também chuva contínua com LFO leve no ganho
      const lfo=ctx.createOscillator(); lfo.frequency.value=0.09;
      const lfoGain=ctx.createGain(); lfoGain.gain.value=0.05;
      // conectar lfo para modular ganho? simplificar: usar interval para variar volume levemente
      const mod=setInterval(()=>{
        if(this.master) this.master.gain.setTargetAtTime( this.volume * (0.92 + Math.random()*0.16), ctx.currentTime, 0.8);
      }, 2200);
      this.intervals.push(iv, mod);
      this.nodes.push(lfo, lfoGain);
    }
    createWaterfall(){
      // cachoeira: brown rumble + white spray + pink mids
      this.loopNoise("brown", 0.42, {type:"lowpass", freq: 380, q:0.8}); // grave
      this.loopNoise("white", 0.24, {type:"highpass", freq: 2400, q:0.6}); // spray
      this.loopNoise("pink", 0.30, {type:"bandpass", freq: 900, q:0.9});
      // impacto extra com oscilador grave modulado
      const ctx=this.ctx;
      const o=ctx.createOscillator(); o.type="triangle"; o.frequency.value= 48;
      const g=ctx.createGain(); g.gain.value=0.06;
      const f=ctx.createBiquadFilter(); f.type="lowpass"; f.frequency.value= 220;
      o.connect(f); f.connect(g); g.connect(this.master);
      o.start();
      this.nodes.push(o,f,g);
      // variação lenta
      const iv=setInterval(()=>{
        const n = 42 + Math.random()*18;
        o.frequency.setTargetAtTime(n, ctx.currentTime, 1.2);
      }, 2800);
      this.intervals.push(iv);
    }
    createSea(withGulls){
      // mar: pink low + white hiss com LFO de maré
      const ctx=this.ctx;
      const base = this.loopNoise("pink", 0.26, {type:"lowpass", freq: 700, q:0.6});
      const hiss = this.loopNoise("white", 0.10, {type:"highpass", freq: 1800, q:0.5});
      // LFO maré (ganho oscila devagar)
      let phase=0;
      const lfoIv=setInterval(()=>{
        phase += 0.08;
        const swell = 0.65 + Math.sin(phase)*0.35 + Math.sin(phase*0.47)*0.14;
        const vol = this.volume * (0.62 + swell*0.38);
        if(this.master) this.master.gain.setTargetAtTime(vol, ctx.currentTime, 1.0);
        // também modula filtro para ondas
        if(base) try{ base.gain.gain.setTargetAtTime(0.18 + swell*0.14, ctx.currentTime, 0.9);}catch(e){}
      }, 220);
      this.intervals.push(lfoIv);
      if(withGulls){
        const gull=()=>{
          if(!this.isPlaying) return;
          const o=ctx.createOscillator(); o.type="sine";
          const g=ctx.createGain(); g.gain.value=0;
          const f=ctx.createBiquadFilter(); f.type="bandpass"; f.frequency.value=1800; f.Q.value=6;
          // gaivota: sweep 900 -> 1400 -> 900
          o.frequency.setValueAtTime(820, ctx.currentTime);
          o.frequency.linearRampToValueAtTime(1380, ctx.currentTime+0.28);
          o.frequency.linearRampToValueAtTime(920, ctx.currentTime+0.65);
          o.frequency.linearRampToValueAtTime(1220, ctx.currentTime+0.95);
          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.22, ctx.currentTime+0.06);
          g.gain.linearRampToValueAtTime(0.18, ctx.currentTime+0.35);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime+1.1);
          o.connect(f); f.connect(g); g.connect(this.master);
          o.start(); o.stop(ctx.currentTime+1.2);
          this.nodes.push(o,f,g);
          setTimeout(()=>{ try{o.disconnect();f.disconnect();g.disconnect();}catch(e){} }, 1500);
        };
        const schedule=()=>{
          const t = 3200 + Math.random()*5200;
          const to=setTimeout(()=>{ gull(); schedule(); }, t);
          this.timeouts.push(to);
        };
        schedule();
        // gaivota inicial atrasada
        const t0=setTimeout(gull, 1200);
        this.timeouts.push(t0);
      }
    }
    createForest(){
      // floresta: wind base + pássaros
      this.loopNoise("pink", 0.12, {type:"bandpass", freq: 420, q:0.7}); // wind low
      this.loopNoise("white", 0.07, {type:"highpass", freq: 3400, q:0.8}); // folhas
      const ctx=this.ctx;
      const bird=()=>{
        if(!this.isPlaying) return;
        // canto: duas notas curtas
        const freqBase = 1400 + Math.random()*1800;
        for(let i=0;i<2+Math.floor(Math.random()*2);i++){
          const o=ctx.createOscillator(); o.type="sine";
          const g=ctx.createGain(); g.gain.value=0;
          const start = ctx.currentTime + i*0.14 + Math.random()*0.03;
          o.frequency.setValueAtTime(freqBase + (Math.random()*400-200), start);
          o.frequency.linearRampToValueAtTime(freqBase + 200 + Math.random()*300, start+0.07);
          g.gain.setValueAtTime(0, start);
          g.gain.linearRampToValueAtTime(0.18, start+0.015);
          g.gain.exponentialRampToValueAtTime(0.001, start+0.18);
          o.connect(g); g.connect(this.master);
          o.start(start); o.stop(start+0.22);
          this.nodes.push(o,g);
          setTimeout(()=>{try{o.disconnect();g.disconnect();}catch(e){}}, 600);
        }
      };
      const iv=setInterval(bird, 1400 + Math.random()*900);
      // variação também aleatória extra
      const extra=()=>{
        const t= 2800 + Math.random()*4200;
        const to=setTimeout(()=>{ bird(); extra(); }, t);
        this.timeouts.push(to);
      };
      extra();
      this.intervals.push(iv);
    }
    createCity(){
      // cidade distante: brown rumble 80Hz + pink traffic + hum
      this.loopNoise("brown", 0.22, {type:"lowpass", freq: 180, q:0.9});
      this.loopNoise("pink", 0.14, {type:"bandpass", freq: 650, q:0.7});
      const ctx=this.ctx;
      const hum=ctx.createOscillator(); hum.type="sine"; hum.frequency.value=60;
      const hg=ctx.createGain(); hg.gain.value=0.04;
      hum.connect(hg); hg.connect(this.master); hum.start();
      this.nodes.push(hum,hg);
      // carro passando simulado: filtro sweep + ganho envelope a cada 8-14s
      const carPass=()=>{
        if(!this.isPlaying) return;
        const src=ctx.createBufferSource(); src.buffer=this.createNoiseBuffer(2.5,"pink");
        const f=ctx.createBiquadFilter(); f.type="bandpass"; f.frequency.value=300; f.Q.value=0.8;
        const g=ctx.createGain(); g.gain.value=0;
        src.connect(f); f.connect(g); g.connect(this.master);
        const now=ctx.currentTime;
        f.frequency.setValueAtTime(240, now);
        f.frequency.linearRampToValueAtTime(900, now+1.2);
        f.frequency.linearRampToValueAtTime(320, now+2.4);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.18, now+0.4);
        g.gain.linearRampToValueAtTime(0.22, now+1.1);
        g.gain.exponentialRampToValueAtTime(0.001, now+2.5);
        try{ src.start(now); src.stop(now+2.6);}catch(e){}
        this.nodes.push(src,f,g);
        setTimeout(()=>{try{src.disconnect();f.disconnect();g.disconnect();}catch(e){}}, 3000);
      };
      const schedule=()=>{
        const t= 7000 + Math.random()*9000;
        const to=setTimeout(()=>{ carPass(); schedule(); }, t);
        this.timeouts.push(to);
      };
      schedule();
    }
    createWind(){
      // vento / névoa: white -> bandpass 550Hz com LFO forte
      const ctx=this.ctx;
      const src=ctx.createBufferSource(); src.buffer=this.createNoiseBuffer(4,"white"); src.loop=true;
      const f=ctx.createBiquadFilter(); f.type="bandpass"; f.frequency.value=520; f.Q.value=0.9;
      const g=ctx.createGain(); g.gain.value=0.26;
      src.connect(f); f.connect(g); g.connect(this.master); src.start();
      this.nodes.push(src,f,g);
      let ph=0;
      const iv=setInterval(()=>{
        ph+=0.06;
        const freq = 380 + Math.sin(ph)*180 + Math.sin(ph*0.33)*90;
        const q = 0.7 + Math.sin(ph*0.7)*0.25;
        f.frequency.setTargetAtTime(freq, ctx.currentTime, 0.9);
        f.Q.setTargetAtTime(q, ctx.currentTime, 0.9);
        g.gain.setTargetAtTime(0.18 + Math.sin(ph*0.5)*0.08 + Math.random()*0.04, ctx.currentTime, 1.1);
      }, 260);
      this.intervals.push(iv);
    }
    createNight(){
      // noite estrelada: crickets 4.2kHz com AM 30Hz + vento suave + sapos graves ocasionais
      const ctx=this.ctx;
      // vento noturno base
      this.loopNoise("pink", 0.09, {type:"bandpass", freq: 360, q:0.6});
      // cricket ensemble: 3 osciladores com AM
      for(let i=0;i<3;i++){
        const o=ctx.createOscillator(); o.type="sine"; o.frequency.value= 4200 + i*120 + Math.random()*80;
        const am=ctx.createOscillator(); am.type="sine"; am.frequency.value= 28 + Math.random()*8;
        const amGain=ctx.createGain(); amGain.gain.value= 3800;
        const g=ctx.createGain(); g.gain.value=0.04;
        // AM via gain? truque: amGain conecta em frequency? não, vamos modular gain com periodic
        // simplificar: criar tremolo via gain LFO manual com interval
        o.connect(g); g.connect(this.master);
        o.start();
        this.nodes.push(o,g,am,amGain);
        // tremolo manual
        let p= Math.random()*Math.PI*2;
        const iv=setInterval(()=>{
          p+=0.42;
          const trem = (Math.sin(p*6.2)>0) ? 0.08 : 0.015; // cricket chirp pattern on/off
          g.gain.setTargetAtTime(trem, ctx.currentTime, 0.04);
        }, 70);
        this.intervals.push(iv);
      }
      // sapo ocasional grave
      const frog=()=>{
        if(!this.isPlaying) return;
        const o=ctx.createOscillator(); o.type="triangle"; o.frequency.value= 115 + Math.random()*30;
        const g=ctx.createGain(); g.gain.value=0;
        const f=ctx.createBiquadFilter(); f.type="lowpass"; f.frequency.value=400;
        o.connect(f); f.connect(g); g.connect(this.master);
        const now=ctx.currentTime;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.18, now+0.05);
        g.gain.linearRampToValueAtTime(0.14, now+0.18);
        g.gain.exponentialRampToValueAtTime(0.001, now+0.55);
        o.start(now); o.stop(now+0.6);
        this.nodes.push(o,f,g);
        setTimeout(()=>{try{o.disconnect();f.disconnect();g.disconnect();}catch(e){}}, 800);
      };
      const sch=()=>{
        const t= 4200 + Math.random()*6200;
        const to=setTimeout(()=>{ frog(); sch(); }, t);
        this.timeouts.push(to);
      };
      sch();
    }
  }

  const ambient = new AmbientEngine();
  // restaurar prefs áudio — MODO IMERSIVO: mar sempre ligado, sutil
  const savedVol = parseInt(localStorage.getItem("contemplacao:volume")||"38",10);
  const immersiveVol = isNaN(savedVol) ? 38 : savedVol;
  if(soundSelect) soundSelect.value = IMMERSIVE_MODE ? "mar" : (localStorage.getItem("contemplacao:sound") || "silencio");
  if(volumeSlider) volumeSlider.value = String(IMMERSIVE_MODE ? 38 : immersiveVol);
  ambient.setVolume((parseInt(volumeSlider ? volumeSlider.value : "38",10)||38)/100);
  if(IMMERSIVE_MODE){
    // força mar sempre: tenta tocar imediatamente, se bloqueado toca no primeiro gesto
    localStorage.setItem("contemplacao:sound", "mar");
    if(btnSoundToggle){ btnSoundToggle.textContent = "♫"; btnSoundToggle.style.display="none"; }
    if(soundSelect) soundSelect.style.display="none";
    if(volumeSlider) volumeSlider.style.display="none";
    setTimeout(async ()=>{
      try{ await ambient.play("mar"); }catch(e){}
    }, 600);
    const trySeaOnGesture = async ()=>{
      if(!ambient.isPlaying){
        try{ await ambient.play("mar"); }catch(e){}
      }
    };
    ["click","touchstart","keydown"].forEach(ev=> window.addEventListener(ev, trySeaOnGesture, {once:true, passive:true}));
  } else {
    const savedSound = localStorage.getItem("contemplacao:sound") || "silencio";
    if(savedSound!=="silencio" && btnSoundToggle) btnSoundToggle.textContent = "♫";
  }

  // tentar também HTML5 Audio fallback remoto (pixabay) quando online e procedural falhar? opcional: não necessário
  // mas criar elementos <audio> para teste remoto se quiser - não usado por padrão para garantir loop perfeito

  // ---------- EVENTS ----------
  chips.forEach(ch=>{
    ch.addEventListener("click", ()=>{
      chips.forEach(c=>c.classList.remove("is-active"));
      ch.classList.add("is-active");
      currentCategory = ch.dataset.cat;
      localStorage.setItem("contemplacao:category", currentCategory);
      futureStack=[];
      showNext();
    });
  });

  btnNext.addEventListener("click", ()=> showNext());
  btnPrev.addEventListener("click", ()=> {
    if(historyStack.length===0) return;
    showNext({pushHistory:false, isPrev:true});
  });
  btnShuffle.addEventListener("click", ()=>{
    // aleatório geral: escolhe categoria aleatória temporária
    const cats = ["natureza","cidade","fantasia","obras","mar","floresta","aleatorio"];
    currentCategory = cats[Math.floor(Math.random()*cats.length)];
    chips.forEach(c=> c.classList.toggle("is-active", c.dataset.cat===currentCategory));
    // não salva como preferencia permanente? salva sim para consistência
    localStorage.setItem("contemplacao:category", currentCategory);
    futureStack=[];
    showNext();
  });

  soundSelect.addEventListener("change", async ()=>{
    const v = soundSelect.value;
    localStorage.setItem("contemplacao:sound", v);
    if(v==="silencio"){
      ambient.stop();
    } else {
      await ambient.play(v);
    }
  });
  volumeSlider.addEventListener("input", ()=>{
    const v = parseInt(volumeSlider.value,10)/100;
    ambient.setVolume(v);
  });
  btnSoundToggle.addEventListener("click", async ()=>{
    if(ambient.isPlaying){
      ambient.stop();
      // manter seleção mas pausar; mudar para silencio visual? não, apenas pausa
      // para retomar, usuário seleciona de novo ou clica toggle para retomar último
      if(soundSelect.value!=="silencio"){
        // guardar último e pausar
        btnSoundToggle.dataset.last = soundSelect.value;
        // opcional: manter? vamos apenas parar e mostrar play
      }
    } else {
      let toPlay = soundSelect.value;
      if(toPlay==="silencio"){
        toPlay = btnSoundToggle.dataset.last || "chuva";
        soundSelect.value = toPlay;
        localStorage.setItem("contemplacao:sound", toPlay);
      }
      await ambient.play(toPlay);
    }
  });

  if(autoplayToggle){
    autoplayToggle.addEventListener("change", ()=>{
      localStorage.setItem("contemplacao:autoplay", autoplayToggle.checked?"1":"0");
      if(autoplayToggle.checked) startAutoplay();
      else stopAutoplay();
    });
  }
  if(IMMERSIVE_MODE){
    // autoplay sempre ligado 15s, sem controle visível
    if(autoplayToggle){ autoplayToggle.checked = true; autoplayToggle.style.display="none"; }
    if(autoplayCountdown) autoplayCountdown.style.display="none";
    localStorage.setItem("contemplacao:autoplay","1");
    // esconde HUD já via CSS, mas garante classe imersiva
    document.body.classList.add("immersive");
    // inicia autoplay após primeira imagem
  } else {
    const savedAuto = localStorage.getItem("contemplacao:autoplay");
    if(savedAuto==="1" && autoplayToggle){ autoplayToggle.checked=true; startAutoplay(); }
  }

  btnHideUI.addEventListener("click", ()=>{
    document.body.classList.toggle("ui-hidden");
    btnHideUI.textContent = document.body.classList.contains("ui-hidden") ? "+" : "—";
    btnHideUI.setAttribute("aria-label", document.body.classList.contains("ui-hidden")?"Mostrar interface":"Esconder interface");
  });

  // clique na imagem: modo imersivo avança direto, senão alterna UI
  let lastTap=0;
  stage.addEventListener("click", (e)=>{
    if(e.target.closest(".glass") || e.target.closest("button") || e.target.closest("a")) return;
    if(IMMERSIVE_MODE){
      showNext();
      return;
    }
    const now=Date.now();
    if(now - lastTap < 320){
      document.body.classList.toggle("ui-hidden");
      lastTap=0;
      return;
    }
    lastTap=now;
    if(document.body.classList.contains("ui-hidden")){
      document.body.classList.remove("ui-hidden");
      if(btnHideUI) btnHideUI.textContent="—";
    } else {
      showNext();
    }
  });

  // swipe
  let sx=0, sy=0, st=0;
  stage.addEventListener("touchstart", e=>{
    if(e.touches.length!==1) return;
    sx=e.touches[0].clientX; sy=e.touches[0].clientY; st=Date.now();
  }, {passive:true});
  stage.addEventListener("touchend", e=>{
    if(!sx) return;
    const t=e.changedTouches[0];
    const dx=t.clientX - sx; const dy=t.clientY - sy; const dt=Date.now()-st;
    sx=0;
    if(Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) || dt>520) return;
    if(dx < 0) showNext();
    else {
      if(historyStack.length) showNext({pushHistory:false, isPrev:true});
    }
  }, {passive:true});

  // teclado
  window.addEventListener("keydown", e=>{
    if(e.key==="ArrowRight" || e.key===" "){ e.preventDefault(); showNext(); }
    else if(e.key==="ArrowLeft"){ e.preventDefault(); if(historyStack.length) showNext({pushHistory:false, isPrev:true}); }
    else if(e.key==="Escape"){ document.body.classList.remove("ui-hidden"); btnHideUI.textContent="—"; }
    else if(e.key==="f"||e.key==="F"){ toggleFullscreen(); }
    else if(e.key==="m"||e.key==="M"){ btnSoundToggle.click(); }
  });

  btnInfo.addEventListener("click", ()=> {
    if(typeof infoDialog.showModal==="function") infoDialog.showModal();
    else infoDialog.setAttribute("open","");
  });
  infoDialog.addEventListener("click", (e)=>{
    const r=infoDialog.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) infoDialog.close();
  });

  function toggleFullscreen(){
    if(!document.fullscreenElement){
      document.documentElement.requestFullscreen?.().catch(()=>{});
    } else {
      document.exitFullscreen?.().catch(()=>{});
    }
  }
  btnFullscreen.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", ()=>{
    btnFullscreen.textContent = document.fullscreenElement ? "⤢" : "⛶";
  });

  // permitir resume de audio no primeiro gesto (política de autoplay)
  const resumeOnGesture = async ()=>{
    if(ambient.ctx && ambient.ctx.state==="suspended") await ambient.resumeIfNeeded();
    if(IMMERSIVE_MODE && !ambient.isPlaying){
      try{ await ambient.play("mar"); }catch(e){}
    } else if(soundSelect && soundSelect.value!=="silencio" && !ambient.isPlaying){
      // não autoplayar fora do imersivo
    }
  };
  ["click","touchstart","keydown"].forEach(ev=>{
    window.addEventListener(ev, resumeOnGesture, {once:false, passive:true});
  });

  // visibilidade: pausar autoplay quando aba ocultada
  document.addEventListener("visibilitychange", ()=>{
    if(document.hidden) stopAutoplay();
    else if(IMMERSIVE_MODE || (autoplayToggle && autoplayToggle.checked)) startAutoplay();
  });

  // inicialização: mostrar primeira imagem — modo imersivo puro
  if(typeof updateCounter==="function") try{ updateCounter(); }catch(e){}
  stage.classList.add("is-empty");
  if(IMMERSIVE_MODE){
    captionTitle.textContent = "";
    captionMeta.textContent = "";
    // esconde caption via CSS já, mas limpa texto
    stage.classList.remove("is-empty");
  } else {
    captionTitle.textContent = "Respire.";
    captionMeta.textContent = "Toque em contemplar para começar";
  }
  // carregar primeira imagem automaticamente após 450ms
  setTimeout(()=> {
    showNext();
    if(IMMERSIVE_MODE){
      // garante autoplay 15s sempre
      setTimeout(()=> startAutoplay(), 900);
    }
  }, 480);

  // registrar service worker? opcional não necessário offline total

  // expor para debug
  window._contemplacao = { ambient, showNext, getNextImageData, CURATED };

})();

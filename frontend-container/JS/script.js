//Создание мира
let canvas = window.document.querySelector('#render-canvas');


//Создание движка
let engine = new BABYLON.Engine(canvas);


//Создание сцены и присоединение её к движку
let scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0.3, 0.3, 0.3);
scene.enablePhysics();//Подключаем физику к игре
scene.createDefaultEnvironment({
    createSkybox: false,
    createGround: false,
    cameraContrast: 1.7,
    cameraExposure: 1.1
});


//Создание фона
let skybox = new BABYLON.MeshBuilder.CreateBox('skyBox',{size:1000}, scene);
let skyboxMaterial = new BABYLON.StandardMaterial('skyBox', scene);
skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(pathToImage_background, scene);
skyboxMaterial.reflectionTexture.coordinateMode = BABYLON.Texture.SKYBOX_MODE;
skyboxMaterial.backFaceCulling = false;
skybox.material = skyboxMaterial;



//Создание камеры
let camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 5, -30), scene);
camera.setTarget(new BABYLON.Vector3(0, 0, 0));


//Создание света - точечный свет
let light = new BABYLON.PointLight('light', new BABYLON.Vector3(10, 10, 0), scene);
light.intensity = 0.2;


//Создание генератора теней
let shadowGenerator = new BABYLON.ShadowGenerator(1024, light);


//Создание платформы и материала для неё
let platformArray = [];
const createPlatform = (zPos) => {
    let platform = new BABYLON.MeshBuilder.CreateBox('box', {
        width: 6,
        height: 0.1,
        depth: 6,
        wrap: true
    }, scene);
    let boxMaterial = new BABYLON.StandardMaterial('marerial', scene);
    boxMaterial.emissiveTexture = new BABYLON.Texture(pathToImage_platform); 
    platform.material = boxMaterial;
    platform.receiveShadows = true;
    platform.physicsImpostor = new BABYLON.PhysicsImpostor(
        platform,
        BABYLON.PhysicsImpostor.BoxImpostor, { //Физические свойства
        mass: 0
    },
        scene);
    platform.position.z = zPos;
    platformArray.push(platform);
}

// Создание монетки
let coinArray = [];
const createCoin = (pos) => {
    BABYLON.SceneLoader.ImportMesh(
        null,
        pathToImage_coin,
        'scene.gltf',
        scene,
        (meshArray) => {
            let coin = meshArray[0];
            coin.scaling = new BABYLON.Vector3(0.04, 0.04, 0.04,); //Размер монетки
            coin.position = pos //Позиция монетки
            shadowGenerator.addShadowCaster(coin); //создание тени
            coin.receiveShadows = true;
            coinArray.push(coin);
            shopIcon.style.display = 'block';
        }
        
    )
}


//Создание препядствий
let lastRand = 0;//Глобальная переменная
let boxArray = []; //Массив для хранения всех блоков
let pointArray = []
const CreateBox = (xPos, zPos) => {
    let box = new BABYLON.MeshBuilder.CreateBox('box', {
        width: 2,
        height: 1,
        depth: 1
    }, scene);
    box.position = new BABYLON.Vector3(xPos, 0.6, 3 + zPos) //Координаты
    let boxMaterial = new BABYLON.StandardMaterial('marerial', scene);
    boxMaterial.emissiveTexture = new BABYLON.Texture(pathToImage_obstacle); 
    box.material = boxMaterial;
    box.receiveShadows = true;
    box.physicsImpostor = new BABYLON.PhysicsImpostor(
        box,
        BABYLON.PhysicsImpostor.BoxImpostor,
        {
            mass: 0
        },
        scene);
    shadowGenerator.getShadowMap().renderList.push(box); //Для теней
    box.receiveShadows = true;
    boxArray.push(box);
}
const CreateBoxRow = (zPos) => { //Этим мы обозначаем ряд препядствий
    let rand = Math.floor(Math.random() * 3) //для коробки, которая не отображается
    while (rand === lastRand) {
        rand = Math.floor(Math.random() * 3)
    }
    lastRand = rand;
    for (let i = 0; i < 3; i++) {
        if (i === rand) {
            if (zPos === 30){
                createCoin(new BABYLON.Vector3((i * 2) - 2, 1, 3 + zPos))
            }
            else if (Math.random() < 0.65) {   //Создание монетки с шансом 65% между препядствиями
                createCoin(new BABYLON.Vector3((i * 2) - 2, 1, 3 + zPos))
            }

            pointArray.push(new BABYLON.Vector3((i * 2) - 2, 0, 3 + zPos))    //создание невидимых точек
            continue;

        };
        CreateBox((i * 2 - 2), zPos);
    }
}



//Создание героя и материала для него
const CreateGarry = (textureNum, needPhysics = true) => {
    let Garry = new BABYLON.MeshBuilder.CreateSphere('sphere', {
        diameter: 0.8
    }, scene);
    Garry.position.y = 0.6;
    let GarryMaterial = new BABYLON.StandardMaterial('kosh5', scene);
    // GarryMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    // GarryMaterial.specularPower = 64;
    // GarryMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    GarryMaterial.emissiveTexture = new BABYLON.Texture(`${x}${textureNum}.jpg`, scene);
    // GarryMaterial.emissiveFresnelParameters = new BABYLON.FresnelParameters();
    // GarryMaterial.emissiveFresnelParameters.bias = 0.3;
    // GarryMaterial.emissiveFresnelParameters.power = 2;
    // GarryMaterial.emissiveFresnelParameters.leftColor = BABYLON.Color3.Red();
    // GarryMaterial.emissiveFresnelParameters.rightColor = BABYLON.Color3.Blue();
    Garry.material = GarryMaterial;
    shadowGenerator.getShadowMap().renderList.push(Garry);
    if(needPhysics){ Garry.physicsImpostor = new BABYLON.PhysicsImpostor(
        Garry,
        BABYLON.PhysicsImpostor.SphereImpostor, { //Присваеваем объекту физические свойства
        mass: 1,
        friction: 5 //трение
    },
        scene
    
    )};
    return Garry;
    
}


//Алгоритм
//Извлеченеи тегов из разметки
let scoreInfo = window.document.querySelector('#score'); // переменная которая выводит очки на экран
let coininfo = window.document.querySelector('#coin-score'); // переменная которая выводит количество монет на экран
let playScreen = window.document.querySelector('#play-screen');
let gameOverScreen = window.document.querySelector('#game-over-screen');
let bestScoreInfo = window.document.querySelector('#best-score');
let nowScoreInfo = window.document.querySelector('#now-score');
let shopIcon = window.document.querySelector('#shop-icon');
let backIcon = window.document.querySelector('#back-icon');
let shopScreen = window.document.querySelector('#shop-screen');
let priceBlock = window.document.querySelector('#price-block');


//Константы
const IN_MOVE = 'in_move';
const PLAY = 'play';
const GAME_OVER = 'game-over';


//Переменные
let score = 0; //переменная для подсчета очков
let coin = 0; //переменная для подсчета монет
let state = PLAY; //Текущее состояние приложения
let Garry = null;
let speed = 8;
let demoArray = [];
let demoTimer = null;
let shopState = ['1', '0', '0', '0', '0'];
let priceArray = [30, 4000, 50, 60, 70];
let activeTexture = 0;
let demoPos = 0;

//Функции
const updatePriceBlock = () => {
    (shopState[demoPos] === '1')
    ? priceBlock.style.opacity = '0'
    :priceBlock.style.opacity = '1';
    window.document.querySelector('#price').innerText = priceArray[demoPos];
}
const arrowClick = (dir) => {
    demoPos += dir;
    if (demoPos < 0) demoPos = 4
    else if (demoPos > 4) demoPos = 0;
    demoArray[0].material.emissiveTexture = new BABYLON.Texture(`${x}${demoPos}.jpg`,scene);
    updatePriceBlock();
}
const saveShopState = () => {
    window.localStorage.setItem('shopState', shopState.join(','))
    window.localStorage.setItem('activeTexture', activeTexture);
}
const loadShopState = () => {
    shopState = (window.localStorage.getItem('shopState'))
    ? window.localStorage.getItem('shopState').split(',')
    :shopState;
    activeTexture = (window.localStorage.getItem('activeTexture'))
    ? Number.parseInt(window.localStorage.getItem('activeTexture'))
    :activeTexture;
}
const clearArray = (Array, isMesh = true) => {
    if(isMesh) Array.map(elem => elem.dispose());
    while (Array.length) Array.pop();
}
const deleteDemoObject = () => {
    clearArray(demoArray);
    clearInterval(demoTimer);
}
const createDemoObjects = () => {
    for(let i = 0; i < 2;i++){
        let Garry = CreateGarry(activeTexture, false);
        Garry.position = new BABYLON.Vector3(0, i*4, i*2);
        Garry.scaling = new BABYLON.Vector3(2, 2, 2);
        demoArray.push(Garry);
    }
    demoTimer = setInterval(()=>{
        demoArray[1].rotate(
            new BABYLON.Vector3(-1, 0 , -1),
            Math.PI * (engine.getDeltaTime()/1000),
            BABYLON.Space.WORLD
        )
    }, 20);
updatePriceBlock();
}
const deleteGameObject = () => {
    Garry.dispose();
    clearArray(coinArray);
    clearArray(boxArray);
    clearArray(platformArray);
    clearArray(pointArray, false);
}
const createGameObjects = () => {
    for (let i = 0; i < 9; i++) {
        createPlatform(i * 6);
        if (i === 0) continue;
        CreateBoxRow(i * 6);
    }
    Garry = CreateGarry(activeTexture);
    score = 0;
    scoreInfo.innerText = `${score}`;
    speed = 8;
}
const newRoadBlock = (zPos) => {
    createPlatform(zPos*6);
    CreateBoxRow(zPos*6);

}
const saveCoin = () => {
    window.localStorage.setItem('coin', coin);
}
const loadCoin = () => {
        coin = (window.localStorage.getItem('coin'))
            ? window.localStorage.getItem('coin')
            : 0
            ;
        coininfo.innerText = coin;
    }
const saveBestScore = () => {
    window.localStorage.setItem('bestScore', score);
}
const loadBestScore = () => {
    return (window.localStorage.getItem('bestScore'))
        ? window.localStorage.getItem('bestScore')
        : 0
    ;
}
const setgameOverScreen = () => { //Окно GAME OVER
    state = GAME_OVER;
    playScreen.style.display = 'none'; 
    gameOverScreen.style.display = 'block';
    let bestScore = loadBestScore();
    if (score > bestScore){
        saveBestScore();
        bestScore = score;
    }
    bestScoreInfo.innerText = `BEST: ${bestScore}`;
    nowScoreInfo.innerText = `NOW: ${score}`;
}
loadShopState();
loadCoin();
createGameObjects();


//Встроенные функции Babylon.js
scene.registerBeforeRender(() => { //Проверка не столкнулся ли мяч с препядствиями  
    if(Garry.getAbsolutePosition().y <= 0) setgameOverScreen();
    for (let i = 0; i < boxArray.length; i++) {
        if (Garry.intersectsMesh(boxArray[i], true)) {
            boxArray[i].material.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
            setgameOverScreen();
        }
    }
    for (let i = 0; i < coinArray.length; i++) {  //Проверка не столкнулся ли мяч с монеткой
        if (Garry.intersectsMesh(coinArray[i], false)) {
            coin++;
            coininfo.innerText = coin;
            saveCoin();
            coinArray[i].dispose(); //удаление объекта со сцены 
            coinArray.splice(i, 1)// //При первом столкновении удаляется монетка
        }
    }
    for (let i = 0; i < pointArray.length; i++) {  //Проверка на столкновение с невидимой точкой
        if (Garry.intersectsPoint(pointArray[i])) {
            scoreInfo.innerText = score;
            score++;
            pointArray.splice(i, 1); //При первом столкновении невидимый куб удаляется
            if (pointArray.length <= 9){
                newRoadBlock((pointArray[pointArray.length - 1].z+3)/6);
            }
        }
    }
})
engine.runRenderLoop(() => {
    camera.position.z = Garry.getAbsolutePosition().z - 12;
    light.position.z = Garry.getAbsolutePosition().z;
    scene.render();
});


//Обработчики событий
priceBlock.addEventListener("mousedown",
(event)=>{
    if(shopState[demoPos] === '0'){
        if (priceArray[demoPos] <= coin){
            coin -= priceArray[demoPos];
            coininfo.innerText = coin;
            saveCoin();
            shopState[demoPos] = '1';
            saveShopState();
            updatePriceBlock();
        }
    }else{
        activeTexture = demoPos;
        saveShopState();
        demoArray[1].material.emissiveTexture = new BABYLON.Texture(`${x}${activeTexture}.jpg`, scene);
    }
})

shopIcon.addEventListener("mousedown",
      (event)=>{
        shopIcon.style.display = 'none';
        backIcon.style.display = 'block';
        playScreen.style.display = 'none';
        shopScreen.style.display = 'block';
        deleteGameObject();
        createDemoObjects();
});
backIcon.addEventListener("mousedown",
      (event)=>{
        shopIcon.style.display = 'block';
        backIcon.style.display = 'none';
        playScreen.style.display = 'block';
        shopScreen.style.display = 'none';
        deleteDemoObject();
        createGameObjects();
});
document.addEventListener('keydown', (event) => { //кнопочка enter
    if (event.keyCode === 13) {
        window.location.reload()
    }
});
window.addEventListener('keypress', (event) => {//Управление WASD
    if (state !== GAME_OVER){
        
    if (event.key == 'a' || event.key == 'A' || event.key == 'ф' || event.key == 'Ф') {
        Garry.physicsImpostor.applyImpulse(
            new BABYLON.Vector3(-15, 0, 0),
            Garry.getAbsolutePosition()
           
        );
    }
    if (event.key == 'd' || event.key == 'D' || event.key == 'в' || event.key == 'В') {
        Garry.physicsImpostor.applyImpulse(
            new BABYLON.Vector3(15, 0, 0),
            Garry.getAbsolutePosition()
        );
    }
}else{
    gameOverScreen.style.display = 'none';
    deleteGameObject();
    createGameObjects();
    playScreen.style.display = 'block';
    state = PLAY;
}
});
window.addEventListener('keydown', (event) => {//Управление стрелкой
    if (state !== GAME_OVER){
    if (event.key == 'ArrowLeft') {
        Garry.physicsImpostor.applyImpulse(
            new BABYLON.Vector3(-15, 0, 0),
            Garry.getAbsolutePosition()
        );
    }
    if (event.key == 'ArrowRight') {
        Garry.physicsImpostor.applyImpulse(
            new BABYLON.Vector3(15, 0, 0),
            Garry.getAbsolutePosition()
        );
    }
}else{
    gameOverScreen.style.display = 'none';
    deleteGameObject();
    createGameObjects();
    playScreen.style.display = 'block';
    state = PLAY;
}
});
window.addEventListener('keyup', () => {
    Garry.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 10));
   
    if (score % 10 === 0) {
        speed = speed + 1;
    }
    Garry.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, speed));// Если очков больше 5 мяч ускоряется
    Garry.physicsImpostor.setAngularVelocity(new BABYLON.Vector3(0, 0, 0));
});
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
}); 

let coin_last = (window.localStorage.getItem('coin'))
var xhr = new XMLHttpRequest();
// var json = JSON.stringify(coin_last, score_last);   //здесь вставляем и отправляем Ваши данные
var json = JSON.stringify({"coin" : coin_last});   //здесь вставляем и отправляем Ваши данные
xhr.open("POST", '', true)
xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
// Отсылаем объект в формате JSON и с Content-Type application/json
xhr.send(json);


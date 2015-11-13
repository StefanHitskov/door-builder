function createScene(data) {


    var id;

    var gui = new dat.GUI();
    var f = gui.addFolder('elem');
    var e;
    var pointL = {
        intensity: 1,
        color: 0xffffff,
        x: -6000,
        height: 3000,
        z: 0,
        xzAngle: 0,
        yAngle: 0,
        distance: 6000
    };

    var selected;


    var controls;
    var camera;
    var scene;
    var skyBox;
    var renderer;


    var pointLight;
    var spotLight;
    var ambLight;
    var hemLight;


    var profileGeom;

    var objects = [];

    var doors = [];

    var rail1 = [];
    var rail2 = [];


    init('#container', true);

    addCamera();

    addLight();

    var profileThickness;

    load(data.profile, function (geom) {

        profileGeom = geom;





        //var texture = new THREE.TextureLoader().load("textures/alum.jpg");
        //var bump = new THREE.TextureLoader().load("textures/bump/alum.png");


        var railMaterial = new THREE.MeshPhongMaterial({
            //map : texture,
            color : data.color,
            shininess: 100,
            //bumpMap: bump,
            bumpScale: 2,
        });

        //var door = new Door(data.width, data.height, '1', 'derevo');
        //door.door.rotation.y = Math.PI / 2;
        //door.door.position.x = -20;
        var box = new THREE.Box3().setFromObject( new THREE.Mesh(profileGeom) );
        profileThickness = box.size().y;

        var rail = createTopRail(data.width - profileThickness * data.perehlest, railMaterial);
        rail.position.y = data.height / 2 + 40;
        rail.rotation.y = Math.PI;
        rail.position.z = data.width / data.count / 2;

        var railGabarites = new THREE.BoundingBoxHelper(rail, 0xff0000);
        scene.add(rail);


        load('rrrr2', function(railGeom){
            //var material = new THREE.MeshPhongMaterial({
            //    color: data.color,
            //    shininess: 100,
            //});

            var rail = create(railGeom, railMaterial);
            rail.scale.set(1, 1, data.width - profileThickness * data.perehlest);
            //rail.rotation.y = Math.PI;
            rail.position.set(0 , -data.height / 2 - 5, data.width / data.count / 2);
            scene.add(rail);
        });

        //rail.position.z = -data.width + data.width / data.count / 2;

        console.log(profileThickness);
        var count = 0;

        for (var i = 0; i < data.count; i++) {

            var door = new Door(data.width / data.count, data.height, 'derevo', data.color);
            doors.push(door);
            door.door.rotation.y = Math.PI / 2;

            var pos = i % 2 == 0 ? -20 : 20;

            if(i % 2 == 0){
                rail1.push(door);
                door.position = rail1.length - 1;
                door.rail = rail1;
                pos = -20;
            } else {
                pos = 20;
                rail2.push(door);
                door.rail = rail2;
                door.position = rail2.length - 1;
            }

            door.door.position.x = pos;
            door.door.position.z = -(i * data.width / data.count - count * profileThickness);

            if(count < data.perehlest){
                //door.door.position.z = -(i * data.width / data.count - count * profileThickness);

                count++;
            }

        }



        initDrag();


        //createSkyBox({
        //    sky: 'sunnyDay',
        //    size: 100000,
        //    format: 'png'
        //});



        function initDrag() {
            var drag = false;
            var selected;
            var getSpeed;
            var hasMove = false;
            var speed;
            var elem;


            function down(event) {
                event.preventDefault();
                if(!event.ctrlKey){
                    return;
                }

                var raycaster = new THREE.Raycaster();
                var mouse = new THREE.Vector2();
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);

                var intersects = raycaster.intersectObjects(objects);


                if (intersects.length > 0) {
                    console.log('selected');
                    getSpeed = speedControl(event);
                    drag = true;
                    elem = intersects[0].object;
                    selected = intersects[0].object.parent.door;
                    //controls.enableRotate = false;
                    controls.enabled = false;
                    //animate(intersects[0].object.parent, {z: 1000}, 2000);
                }
            }

            function move(event) {
                event.preventDefault();
                if (drag && selected) {
                    //console.log('drag');
                    hasMove = true;
                    speed = getSpeed(event);
                    //console.log(speed);
                    var sign = -1;
                    if (camera.position.x < 0) {
                        sign = 1;
                    }



                    railGabarites.update();

                    var left = selected.getLeftDoor();
                    var right = selected.getRightDoor();

                    //console.log(selected.getLeft() + speed * 2 * sign <=  railGabarites.box.max.z);
                    //console.log(selected.getRight()  + speed * 2 * sign >=  railGabarites.box.min.z);
                    //console.log(selected.getLeft() + speed * 2 * sign <= railGabarites.box.max.z && selected.getRight()  + speed * 2 * sign >= railGabarites.box.min.z);
                    if(selected.getLeft() + speed * 3 * sign <= railGabarites.box.max.z && selected.getRight()  + speed * 3 * sign >= railGabarites.box.min.z){
                        if((left == undefined || left.getRight() >= selected.getLeft() + speed * 3 * sign) && (right == undefined || right.getLeft() <= selected.getRight()  + speed * 3 * sign)){
                            selected.door.position.z += speed * 3 * sign;
                        }
                        //console.log('move')

                    }

                    //if (selected.position.z + speed * 2 * sign >= 0 && selected.position.z + speed * 2 * sign <= 640) {
                    //    selected.position.z += speed * 2 * sign;
                    //}
                    //console.log(getSpeed(event));
                }
            }

            function up(event) {
                if (drag && !hasMove) {
                    //selectElem(elem);
                    //console.log(selected);
                    //console.log(selected.test());
                    //elem.material.color = 0x000000;
                }
                elem = undefined;
                hasMove = false;
                event.preventDefault();
                drag = false;
                controls.enabled = true;
            }


            renderer.domElement.addEventListener('mousedown', down);
            renderer.domElement.addEventListener('mousemove', move);
            renderer.domElement.addEventListener('mouseup', up);

            function speedControl(event) {
                var x = event.clientX;
                return function (event) {
                    var speed = event.clientX - x;
                    x = event.clientX;
                    return speed;
                }
            }

        }

    });

    createGUI();




    renderScene();
    //requestAnimationFrame(renderScene);

    function createGUI() {


        function recalc() {
            var xzA = pointL.xzAngle * Math.PI / 180;
            var yA = pointL.yAngle * Math.PI / 180;
            var dst = pointL.distance * Math.cos(yA);

            var x = dst * Math.cos(xzA);
            var z = dst * Math.sin(xzA);
            var y = pointL.distance * Math.sin(yA);


            pointLight.position.x = x;
            pointLight.position.z = z;
            pointLight.position.y = y;
            spotLight.position.x = x;
            spotLight.position.y = y;
            spotLight.target.position.set(0, 0, 0);
        }


        //var angle = 0;
        //rotate();
        //function rotate(){
        //    requestAnimationFrame(rotate);
        //    //angle = angle * Math.PI / 180;
        //
        //    var x = pointL.distance * Math.cos(angle);
        //    var z = pointL.distance * Math.sin(angle);
        //
        //    //console.log(x + ' ' + z);
        //    pointLight.position.x = x;
        //    pointLight.position.z = z;
        //    spotLight.position.x = x;
        //    spotLight.position.z = z;
        //    spotLight.target.position.set(0, 0, 0);
        //    angle+= 0.003;
        //}

        /*
         * X = x0 + (x - x0) * cos(a) - (y - y0) * sin(a);
         Y = y0 + (y - y0) * cos(a) + (x - x0) * sin(a);
         */

        //var xzAngle = 0;

        var pointFolder = gui.addFolder('light');
        pointFolder.add(pointL, 'intensity', 0, 3, 0.005).onChange(function (val) {
            pointLight.intensity = val;
        });

        pointFolder.add(pointL, 'xzAngle', 0, 360, 0.5).onChange(function (a) {
            recalc();
            //a = a * Math.PI / 180;
            //console.log(spotLight.position.x + ' ' + spotLight.position.z);
            //
            //var x = pointL.distance * Math.cos(a);
            //var z = pointL.distance * Math.sin(a);
            //
            ////console.log(x + ' ' + z);
            //pointLight.position.x = x;
            //pointLight.position.z = z;
            //spotLight.position.x = x;
            //spotLight.position.z = z;
            //spotLight.target.position.set(0, 0, 0);

        });

        pointFolder.add(pointL, 'distance', 0, 10000, 1).onChange(function (val) {
            recalc();
            //var a = pointL.xzAngle * Math.PI / 180;
            //
            //var x = val * Math.cos(a);
            //var z = val * Math.sin(a);
            //
            //console.log(x + ' ' + z);
            //pointLight.position.x = x;
            //pointLight.position.z = z;
            //spotLight.position.x = x;
            //spotLight.position.z = z;
            //spotLight.target.position.set(0, 0, 0);
        });

        pointFolder.add(pointL, 'yAngle', 0, 90, 1).onChange(recalc);
        //
        //pointFolder.add(pointL, 'height', -10000, 10000, 1).onChange(function(val){
        //    pointLight.position.y = val;
        //    spotLight.position.y = val;
        //    spotLight.target.position.set(0, 0, 0);
        //
        //});
        //
        //pointFolder.add(pointL, 'z', -10000, 10000, 1).onChange(function(val){
        //    pointLight.position.z = val;
        //    spotLight.position.z = val;
        //    spotLight.target.position.set(0, 0, 0);
        //
        //})

        pointFolder.open();

    }

    function renderScene() {
        id = requestAnimationFrame(renderScene);
        //if(typeof renderTask == 'function'){
        //    renderTask();
        //}
        if (skyBox) {
            skyBox.position.x = camera.position.x;
            skyBox.position.z = camera.position.z;
            skyBox.position.y = camera.position.y;
        }
        renderer.render(scene, camera);
    }

    function init(selector, axes) {
        var container = $(selector);
        container.html('');
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xEEEEEE);
        scene = new THREE.Scene();
        container.append(renderer.domElement);
        if (axes === true) {
            scene.add(new THREE.AxisHelper(200));
        }
    }

    function addCamera(position, lookAt) {
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = true;
        controls.rotateSpeed = 0.5;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        if (typeof position != 'object' || position == null) {
            position = {x: 500, y: 500, z: 500};
        }

        camera.position.z = position.z != undefined ? position.z : 500;
        camera.position.y = position.y != undefined ? position.y : 500;
        camera.position.x = position.x != undefined ? position.x : 500;

        if (typeof lookAt != 'object' || lookAt == null) {
            lookAt = {x: 0, y: 0, z: 0};
        }

        camera.lookAt(lookAt);
        scene.add(camera);
    }

//stub, light with shadow
    function addLight() {

        hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);

        scene.add(hemLight);

        ambLight = new THREE.AmbientLight(0xffffff);
        ambLight.color.setRGB(0.25, 0.25, 0.25);

        scene.add(ambLight);

        spotLight = new THREE.SpotLight(0xffffff, 0.2);
        spotLight.position.set(6000, 0, 0);
        spotLight.castShadow = true;
        spotLight.shadowMapWidth = spotLight.shadowMapHeight = 1024 * 1;
        spotLight.shadowCameraFar = 10000;
        spotLight.shadowCameraFov = 30;

        scene.add(spotLight);
        //scene.add(new THREE.SpotLightHelper(spotLight));


        pointLight = new THREE.PointLight(0xffffff, 1);


        pointLight.position.set(6000, 0, 0);

        scene.add(new THREE.PointLightHelper(pointLight, 50));

        scene.add(pointLight);


        renderer.shadowMap.enabled = true;
        //renderer.shadowMapSoft = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    function createSkyBox(data) {
        if (data.sky == undefined) {
            throw new Error('unable to create skyBox without texture');
        }
        var urlPrefix = "textures/sky/" + data.sky + "/";
        var format = data.format != undefined ? data.format : '.jpg';
        var size = data.size != undefined ? data.size : 100000;
        var urls = [
            urlPrefix + "left." + format, //right
            urlPrefix + "right." + format, //left
            urlPrefix + "top." + format, //top
            urlPrefix + "bottom." + format, //bottom
            urlPrefix + "front." + format, //front
            urlPrefix + "back." + format, //back
        ];
        var textureCube = THREE.ImageUtils.loadTextureCube(urls);
        var shader = THREE.ShaderLib["cube"];
        shader.uniforms["tCube"].value = textureCube;
        var material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide

        });
        skyBox = new THREE.Mesh(new THREE.CubeGeometry(size, size, size), material);
        scene.add(skyBox);
    }



    function selectElem(elem) {
        console.log(elem.material.color);
        selected = {
            elem: elem,
            color: elem.material.color.getHex()
        };
        if (e) {
            f.remove(e);
        }
        //e = f.add('elem');
        e = f.addColor(selected, 'color').onChange(function (val) {
            console.log(val);
            elem.material.color.set(val);
            //elem.update();
        })
    }

    function createDoor(test) {
        var door = new THREE.Object3D();


        var bsepar = createSepar(600);
        bsepar.position.z = 30;

        var tsepar = createSepar(600);
        tsepar.position.y = 1970;
        tsepar.position.z = 30;


        var csepar = createSepar(600);
        csepar.position.y = 1570;
        csepar.position.z = 30;

        var left = createSepar(2000);
        left.rotation.x = Math.PI / 2;
        left.position.y = 2000;


        var right = createSepar(2000);
        right.rotation.x = Math.PI / 2;
        right.position.z = 630;
        right.position.y = 2000;


        var btCenter = createCenter(600, 1540, 'derevo');

        btCenter.rotation.y = Math.PI / 2;
        btCenter.position.y = 1600 / 2;
        btCenter.position.z = 330;
        btCenter.position.x = -7.5;

        door.add(btCenter);


        var tCenter = createCenter(600, 400, 'tree2');
        tCenter.rotation.y = Math.PI / 2;
        tCenter.position.y = 1800;
        tCenter.position.z = 330;
        tCenter.position.x = -7.5;
        door.add(tCenter);


        door.add(left);
        door.add(right);

        door.add(bsepar);
        door.add(tsepar);
        door.add(csepar);

        return door;
    }

    function createCenter(width, height, texturePath) {

        var geom = new THREE.BoxGeometry(width, height, 10);
        var res;
        //
        //if(mirror){
        //    var material = new THREE.MeshBasicMaterial({
        //        //map: texture,
        //        //side: THREE.DoubleSide,
        //        //color      :  new THREE.Color("rgb(155,196,30)"),
        //        //emissive   :  new THREE.Color("rgb(7,3,5)"),
        //        //specular   :  new THREE.Color("rgb(255,113,0)"),
        //        //shininess: 100,
        //        //bumpMap: bmap,
        //        //map        :  smap,
        //        //bumpScale: 0.2,
        //        //envMap : sky
        //        envMap: cam.renderTarget,
        //        //opacity: 0.2,
        //        //transparent: true
        //        //specular : 100
        //
        //    });
        //} else {
        var texture = new THREE.TextureLoader().load("textures/" + texturePath + ".jpg");
        var bmap = new THREE.TextureLoader().load("textures/bump/" + texturePath + ".png");


        var material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
            //color      :  new THREE.Color("rgb(155,196,30)"),
            //emissive   :  new THREE.Color("rgb(7,3,5)"),
            //specular   :  new THREE.Color("rgb(255,113,0)"),
            shininess: 100,
            bumpMap: bmap,
            //map        :  smap,
            bumpScale: 0.2,

            //opacity: 0.2,
            //transparent: true
            //specular : 100

        });
        //}
        material.needsUpdate = true;
        res = new THREE.Mesh(geom, material);


        res.receiveShadow = true;
        res.castShadow = true;


        return res;


    }

    function createSepar(length) {
        var extrudeSettings = {
            amount: length,
            bevelEnabled: false,
            bevelSegments: 1,
            steps: 1,
            bevelSize: 0.2,
            bevelThickness: 1
        };
        var separ = new THREE.Shape();
        separ.moveTo(0, 0);
        separ.moveTo(30, 0);
        separ.moveTo(30, 20);
        separ.moveTo(0, 20);
        separ.moveTo(0, 0);

        return create(new THREE.ExtrudeGeometry(separ, extrudeSettings), new THREE.MeshPhongMaterial({color: 0xBFBFBF}));

    }

    function createTopRail(length, material) {
        var extrudeSettings = {
            amount: length,
            bevelEnabled: false,
            bevelSegments: 1,
            steps: 1,
            bevelSize: 0.2,
            bevelThickness: 1
        };


        var rail = new THREE.Shape();


        rail.moveTo(-40, -38);
        rail.moveTo(-40, -35);
        rail.moveTo(-39, -34);
        rail.moveTo(-39, -11);
        rail.moveTo(-40, -10);
        rail.moveTo(-40, 0);
        rail.moveTo(40, 0);
        rail.moveTo(40, -10);
        rail.moveTo(39, -11);
        rail.moveTo(39, -34);
        rail.moveTo(40, -35);
        rail.moveTo(40, -38);

        rail.moveTo(39, -38);
        rail.moveTo(39, -35);
        rail.moveTo(38, -34);
        rail.moveTo(38, -11);
        rail.moveTo(39, -10);
        rail.moveTo(39, -1);
        rail.moveTo(1, -1);
        rail.moveTo(1, -38);
        rail.moveTo(-1, -38);
        rail.moveTo(-1, -1);

        rail.moveTo(-39, -1);
        rail.moveTo(-39, -10);
        rail.moveTo(-38, -11);
        rail.moveTo(-38, -34);
        rail.moveTo(-39, -35);
        rail.moveTo(-39, -38);
        rail.moveTo(-40, -38);


        //rail.moveTo(0, 0);
        //rail.moveTo(20, 0);
        //rail.moveTo(20, 60);
        //rail.moveTo(0, 60);
        //rail.moveTo(0, 58);
        //rail.moveTo(18, 58);
        //rail.moveTo(18, 31);
        //rail.moveTo(0, 31);
        //rail.moveTo(0, 29);
        //rail.moveTo(18, 29);
        //rail.moveTo(18, 2);
        //rail.moveTo(0, 2);
        //rail.moveTo(0, 0);

        return create(new THREE.ExtrudeGeometry(rail, extrudeSettings), material);
    }

    function addBottomRail(length){

    }

    //function create(geom, material) {
    //    var mesh = new THREE.Mesh(geom, material);
    //    material.needsUpdate = true;
    //    mesh.rotation.z = Math.PI / 2;
    //    mesh.receiveShadow = true;
    //    mesh.castShadow = true;
    //    return mesh;
    //}


    function generateHoles(geom) {
        var res = new ThreeBSP(geom);

        for (var i = -180; i < 200; i += 100) {
            for (var j = 180; j > -200; j -= 100) {


                var d = 1 + Math.random() * 10;

                var cyl = new THREE.CylinderGeometry(d, d, 40, 30, 1, false, 0, Math.PI * 2);
                var cylMaterial = new THREE.MeshBasicMaterial(
                    {color: 'green'});
                var cylMesh = new THREE.Mesh(cyl, cylMaterial);
                cylMesh.position.z = j;
                cylMesh.position.x = i;
                cylMesh.position.y = Math.random() * 15;
                //cylMesh.rotation.x = Math.PI / 2;
                var bsp2 = new ThreeBSP(cylMesh);
                res = res.subtract(bsp2);
                console.log('hole');
                //if(resMesh) resMesh.remove();
                //resMesh = res.toMesh(new THREE.MeshLambertMaterial({color: 'green'}));
                //scene.add(resMesh);
            }
        }
        return res;
    }

    this.stop = function () {
        cancelAnimationFrame(id);
        controls = null;
        camera = null;
        scene = null;
        skyBox = null;
        renderer = null;
    };


    function Door(width, height, texture, color) {
        this.width = width;

        var door = new THREE.Object3D();

        this.helper = new THREE.BoundingBoxHelper(door, 0xff0000);

        //scene.add(helper);


        var box = new THREE.BoxGeometry(width - 10, height, 10);
        var material = getMaterial(texture);
        door.add(create(box, material));

        var btp = createBottomProfile(width - 2 * profileThickness, new THREE.MeshPhongMaterial({color : 'gray'}));
        btp.position.set(-width / 2 + profileThickness, - height / 2, 0);
        btp.rotation.y = Math.PI / 2;

        door.add(btp);
        //console.log(this.object);
        //this.object.position.set(0, 0, 0);
        scene.add(door);
        this.door = door;
        door.door = this;
        var geom = profileGeom;
        objects = objects.concat(door.children);

        //load(profile, function (geom) {
            var material = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 100,
            });
            var side1 = create(geom, material);
            side1.scale.set(height, 1, 1);
            side1.position.x = width / 2;
            side1.rotation.z = -Math.PI / 2;
            //side.position.y = -20;
            door.add(side1);

            var side2 = create(geom, material);
            side2.scale.set(height, 1, 1);
            side2.position.x = -width / 2;
            side2.rotation.z = Math.PI / 2;
            door.add(side2);
            //scene.add(this.door);
        //})

        Door.prototype.test = function(){
            this.helper.update();
            console.log(this.helper.box);
        }

        Door.prototype.getLeft = function(){
            this.helper.update();
            return this.helper.box.max.z;
        }

        Door.prototype.getRight = function(){
            this.helper.update();
            return this.helper.box.min.z;
        }

        Door.prototype.getRightDoor = function(){
            if(this.position < this.rail.length - 1){
                return this.rail[this.position + 1];
            }
        };

        Door.prototype.getLeftDoor = function(){
            if(this.position > 0){
                return this.rail[this.position - 1];
            }
        }
    }

    function getMaterial(texturePath) {
        var texture = new THREE.TextureLoader().load("textures/" + texturePath + ".jpg");
        var bmap = new THREE.TextureLoader().load("textures/bump/" + texturePath + ".png");


        var material = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
            //color      :  new THREE.Color("rgb(155,196,30)"),
            //emissive   :  new THREE.Color("rgb(7,3,5)"),
            //specular   :  new THREE.Color("rgb(255,113,0)"),
            shininess: 100,
            bumpMap: bmap,
            //map        :  smap,
            bumpScale: 0.2,

            //opacity: 0.2,
            //transparent: true
            //specular : 100

        });

        return material;
    }

    function createBottomProfile(length, material){

        var extrudeSettings = {
            amount: length,
            bevelEnabled: false,
            bevelSegments: 1,
            steps: 1,
            bevelSize: 0.2,
            bevelThickness: 1
        };

        var prof = new THREE.Shape();
        prof.moveTo(-7, 0);
        prof.moveTo(-7, 30);
        prof.moveTo(-6, 30);
        prof.moveTo(-6, 50);
        prof.moveTo(6, 50);
        prof.moveTo(6, 30);
        prof.moveTo(7, 30);
        prof.moveTo(7, 0);
        prof.moveTo(-7, 0);

        return create(new THREE.ExtrudeGeometry(prof, extrudeSettings), material);

    }

    function create(geom, material) {
        var res = new THREE.Mesh(geom, material);
        res.castShadow = true;
        res.receiveShadow = true;
        return res;
    }

    function load(model, func) {

        var loader = new THREE.JSONLoader();
        loader.load("models/" + model + '.js', func);
    }

}


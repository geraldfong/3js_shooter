$(function() {
  var $container = $("#container");
  var WIDTH = window.innerWidth - 20;
  var HEIGHT = window.innerHeight - 20;

  var VIEW_ANGLE = 75;
  var ASPECT = WIDTH / HEIGHT;
  var NEAR = 0.01;
  var FAR = 1000;

  var renderer, scene;

  var sphere, cube;
  var beams = [];
  bullets = {};

  var players = {};

  var id;

  init();
  animate();
  serverCommunicate()

  function serverCommunicate() {
    id = "user_" + Math.floor(Math.random() * 10000);
    
    
    jQuery.get("http://geraldfong.com/shooter/api/register", {
      player: {
        id: id,
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      }
    }, function(data, textStatus) {
    });

    pollServer()
  }

  function pollServer() {
    bulletsData = {};
    for (bulletId in bullets) {
      if (!bullets.hasOwnProperty(bulletId)) {
        continue;
      }
      bullet = bullets[bulletId];
      if (bullet.playerId != id) {
        continue;
      }
      bulletsData[bulletId] = {
        id: bulletId,
        x: bullet.position.x,
        y: bullet.position.y,
        z: bullet.position.z,
        playerId: id
      }
    }
    jQuery.get("http://geraldfong.com/shooter/api/poll", {
      player: {
        id: id,
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
      },
      bullets: bulletsData
    }, function(data, textStatus) {
      playersData = data.players;
      bulletsData = data.bullets;
      console.log(bulletsData);
      for (var playerId in playersData) {
        if (!playersData.hasOwnProperty(playerId)) {
          continue;
        }
        if (playerId == id) {
          continue;
        }
        playerData = playersData[playerId];
        if (playerId in players) {
          player = players[playerId];
          player.position.x = playerData.x;
          player.position.y = playerData.y;
          player.position.z = playerData.z;
        } else {
          var playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true });
          var player = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 100, 10, 10), playerMaterial);
          player.position.x = playerData.x;
          player.position.y = playerData.y;
          player.position.z = playerData.z;
          players[playerId] = player;
          scene.add(player);
        }
      }

      for (var bulletId in bulletsData) {
        if (!bulletsData.hasOwnProperty(bulletId)) {
          continue;
        }
        var bulletsData = bulletsData[bulletId];
        if (bulletsData.playerId == id) {
          continue;
        }
        console.log("Current Id");
        if (bulletId in bullets) {
          bullet = bullets[bulletId];
          bullet.position.x = bulletsData.x;
          bullet.position.y = bulletsData.y;
          bullet.position.z = bulletsData.z;
        } else {
          console.log("Adding bullet for first time");
          var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0x25AA00, wireframe: true });
          var bullet = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 20, 10, 10), bulletMaterial);
          bullet.id = bulletsData.id;
          bullet.playerId = bulletsData.playerId;
          bullet.position.x = bulletsData.x;
          bullet.position.y = bulletsData.y;
          bullet.position.z = bulletsData.z;
          bullets[bulletId] = bullet;
          scene.add(bullet);
        }
      }
    });
    setTimeout(pollServer, 3000);
  }

  function init() {

    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.rotation.dy = 0;
    camera.rotation.dx = 0;
    camera.rotation.dp = 0;
    camera.position.ps = 0;
    camera.position.z = 100;
    camera.position.s = 0;
    camera.position.dy = 0;
    scene = new THREE.Scene();

    scene.add(camera);


    var sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xCC0000, wireframe: true});
    sphere = new THREE.Mesh(
      new THREE.SphereGeometry(50, 16, 8),
      sphereMaterial);
    scene.add(sphere);

    var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true });
    cube = new THREE.Mesh(
      new THREE.CubeGeometry(100, 100, 100),
      cubeMaterial);
    scene.add(cube);

    cube2 = new THREE.Mesh( new THREE.CubeGeometry(100, 100, 100), cubeMaterial);
    scene.add(cube2);
    cube2.position.x = 200;
    cube2.position.z = 200;

    cube3 = new THREE.Mesh( new THREE.CubeGeometry(100, 100, 100), cubeMaterial);
    scene.add(cube3);
    cube3.position.x = -200;
    cube3.position.z = 200;
    groundMaterial = new THREE.MeshBasicMaterial( {color: 0x00aaff, wireframe: true});
    ground = new THREE.Mesh(new THREE.CubeGeometry(10000, 10000, 20, 70, 70), groundMaterial);
    ground.position.y -= 120;
    ground.rotation.x += Math.PI / 2;
    scene.add(ground);

    cylinder = new THREE.Mesh(new THREE.CylinderGeometry(500, 500, 2000, 10, 80), cubeMaterial);
    cylinder.position.z = -800;
    cylinder.position.y = 1000;
    scene.add(cylinder);

    renderer = new THREE.CanvasRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    $container.append(renderer.domElement);

  }

  function shoot() {
    var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xABCDEF, wireframe: true });

    var bullet = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 20, 10, 10), cubeMaterial);
    bullet.position.z = camera.position.z;
    bullet.position.y = camera.position.y;
    bullet.position.x = camera.position.x;
    bullet.position.s = 0.3;
    bullet.position.dz = bullet.position.s * Math.cos(camera.rotation.y) * -1;
    bullet.position.dx = bullet.position.s * Math.sin(camera.rotation.y) * -1;
    bullet.id = "bullet_" + Math.floor(Math.random() * 10000000);
    bullet.playerId = id;

    bullets[bullet.id] = bullet;
    scene.add(bullet);
  }


  function animate() {
    requestAnimationFrame( animate );
    sphere.position.x++;
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube2.rotation.x += 0.01;
    cube2.rotation.y += 0.01;
    for (var bulletId in bullets) {
      if (!bullets.hasOwnProperty(bulletId)) {
        continue;
      }
      var bullet = bullets[bulletId];
      if (bullet.playerId != id) {
        continue;
      }
      bullet.position.z += bullet.position.dz;
      bullet.position.x += bullet.position.dx;
    }

    renderer.render(scene, camera);

    camera.rotation.y += camera.rotation.dy;
    camera.rotation.x += camera.rotation.dp;


    camera.position.x += camera.position.s * Math.sin(camera.rotation.y + Math.PI);
    camera.position.z += camera.position.s * Math.cos(camera.rotation.y + Math.PI);
    camera.position.x += camera.position.ps * Math.sin(camera.rotation.y + Math.PI + Math.PI/2);
    camera.position.z += camera.position.ps * Math.cos(camera.rotation.y + Math.PI + Math.PI/2);

    camera.position.y += camera.position.dy;
    camera.position.y = Math.max(-50, camera.position.y);
    camera.position.dy -= 0.3;

  }

  var KEYS = {
    a: 65,
    d: 68,
    w: 87,
    s: 83,
    e: 69,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
  }

  var KEY_PRESS = {
    space: 32,
    e: 101
  }

  $(document).keydown(function (e) {
    if (e.keyCode == KEYS.left) { // pan left
      camera.rotation.dy = 0.018;
    } else if (e.keyCode == KEYS.right) { // pan right
      camera.rotation.dy = -0.018;
    } else if (e.keyCode == KEYS.up) { // tilt up
      camera.rotation.dp = 0.018;
    } else if (e.keyCode == KEYS.down) { // tilt down
      camera.rotation.dp = -0.018;
    } else if (e.keyCode == KEYS.a ) { // strafe left
      camera.position.ps = 4;
    } else if (e.keyCode == KEYS.w ) { // forward
      camera.position.s = 4;
    } else if (e.keyCode == KEYS.d) { // strafe right
      camera.position.ps = -4;
    } else if (e.keyCode == KEYS.s) { // backwards
      camera.position.s = -4;
    }
  });

  $(document).keypress(function (e) {
    if (e.keyCode == KEY_PRESS.space) { // jump
      camera.position.dy = 8;
    } else if (e.keyCode == KEY_PRESS.e) {
      shoot();
    }
  });

  $(window).keyup(function (e) {
    if (e.keyCode == KEYS.left) { // pan left
      camera.rotation.dy = 0;
    } else if (e.keyCode == KEYS.right) { // pan right
      camera.rotation.dy = 0;
    } else if (e.keyCode == KEYS.up) { // tilt up
      camera.rotation.dp = 0;
    } else if (e.keyCode == KEYS.down) { // tilt down
      camera.rotation.dp = 0;
    } else if (e.keyCode == KEYS.a ) { // strafe left
      camera.position.ps = 0;
    } else if (e.keyCode == KEYS.w ) { // forward
      camera.position.s = 0;
    } else if (e.keyCode == KEYS.d) { // strafe right
      camera.position.ps = 0;
    } else if (e.keyCode == KEYS.s) { // backwards
      camera.position.s = 0;
    }
  });

});

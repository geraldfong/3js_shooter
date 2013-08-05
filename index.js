$(function() {
  var $container = $("#container");
  var WIDTH = window.innerWidth - 20;
  var HEIGHT = window.innerHeight - 20;

  var VIEW_ANGLE = 75;
  var ASPECT = WIDTH / HEIGHT;
  var NEAR = 0.01;
  var FAR = 800;

  var renderer, scene;

  var sphere, cube;
  var beams = [];
  var bullets = {};

  var players = {};

  var cageSize = 750;

  view = {
    theta: 0,
    phi: Math.PI/2,
    dtheta: 0,
    dphi: 0
  };

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
        var bulletData = bulletsData[bulletId];
        if (bulletData.playerId == id) {
          continue;
        }
        if (bulletId in bullets) {
          bullet = bullets[bulletId];
          bullet.position.x = bulletData.x;
          bullet.position.y = bulletData.y;
          bullet.position.z = bulletData.z;
        } else {
          console.log("Adding bullet for first time");
          var bulletMaterial = new THREE.MeshBasicMaterial({ color: 0x25AA00, wireframe: true });
          var bullet = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 20, 10, 10), bulletMaterial);
          bullet.id = bulletData.id;
          bullet.playerId = bulletData.playerId;
          bullet.position.x = bulletData.x;
          bullet.position.y = bulletData.y;
          bullet.position.z = bulletData.z;
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

    var wallMaterial = new THREE.MeshBasicMaterial( {color: 0x00daff, wireframe: true});
    // positive x
    wall1 = new THREE.Mesh(new THREE.CubeGeometry(cageSize, cageSize, 0, 10, 10), wallMaterial);
    wall1.position.y += cageSize/2;
    wall1.position.z += cageSize/2;
    scene.add(wall1);

    // negative x
    wall2 = new THREE.Mesh(new THREE.CubeGeometry(cageSize, cageSize, 0, 10, 10), wallMaterial);
    wall2.position.y += cageSize/2;
    wall2.position.z -= cageSize/2;
    scene.add(wall2);

    // positive z
    wall3 = new THREE.Mesh(new THREE.CubeGeometry(cageSize, cageSize, 0, 10, 10), wallMaterial);
    wall3.rotation.y += Math.PI/2;
    wall3.position.y += cageSize/2;
    wall3.position.x += cageSize/2;
    scene.add(wall3);

    // negative z
    wall4 = new THREE.Mesh(new THREE.CubeGeometry(cageSize, cageSize, 0, 10, 10), wallMaterial);
    wall4.rotation.y += Math.PI/2;
    wall4.position.y += cageSize/2;
    wall4.position.x -= cageSize/2;
    scene.add(wall4);

    // positive y
    wall5 = new THREE.Mesh(new THREE.CubeGeometry(cageSize, cageSize, 0, 10, 10), wallMaterial);
    wall5.position.y += cageSize;
    wall5.rotation.x += Math.PI / 2;
    scene.add(wall5);

    // low y
    wall6 = new THREE.Mesh(new THREE.CubeGeometry(cageSize, cageSize, 0, 10, 10), wallMaterial);
    wall6.rotation.x += Math.PI / 2;
    scene.add(wall6);

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
    bullet.position.s = 6;
    var coords = sphereToCart(view.theta, view.phi, 1);
    bullet.position.dx = coords.x;
    bullet.position.dy = coords.y;
    bullet.position.dz = coords.z;
    bullet.id = "bullet_" + Math.floor(Math.random() * 10000000);
    bullet.playerId = id;

    bullets[bullet.id] = bullet;
    scene.add(bullet);
  }

  function boomerang() {
    var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF, wireframe: true });

    var beam = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 20, 10, 10), cubeMaterial);
    beam.position.z = camera.position.z;
    beam.position.y = camera.position.y;
    beam.position.x = camera.position.x;
    beam.position.s = 50;
    beam.position.dz = beam.position.s * Math.cos(camera.rotation.y) * -1;
    beam.position.dx = beam.position.s * Math.sin(camera.rotation.y) * -1;

    beams.push(beam);
    scene.add(beam);
  }


  function animate() {
    requestAnimationFrame( animate );
    sphere.position.x++;
    for (var bulletId in bullets) {
      if (!bullets.hasOwnProperty(bulletId)) {
        continue;
      }
      var bullet = bullets[bulletId];
      if (bullet.playerId != id) {
        continue;
      }
      bullet.position.x += bullet.position.dx;
      bullet.position.y += bullet.position.dy;
      bullet.position.z += bullet.position.dz;
      if (bullet.position.x >= cageSize/2 || bullet.position.x <= -cageSize/2) {
        bullet.position.dx *= -1;
      }
      if (bullet.position.y >= cageSize || bullet.position.y <= 0) {
        bullet.position.dy *= -1;
      }
      if (bullet.position.z >= cageSize/2 || bullet.position.z <= -cageSize/2) {
        bullet.position.dz *= -1;
      }
    }

    renderer.render(scene, camera);

    view.phi += view.dphi;
    view.theta += view.dtheta;
    camera.lookAt(sphereToCartVector(view.theta, view.phi, {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z
    }));

    camera.position.x += camera.position.s * Math.cos(view.theta);
    camera.position.z += camera.position.s * Math.sin(view.theta);
    camera.position.x += camera.position.ps * Math.cos(view.theta + Math.PI/2);
    camera.position.z += camera.position.ps * Math.sin(view.theta + Math.PI/2);

    camera.position.y += camera.position.dy;
    camera.position.y = Math.max(50, camera.position.y);
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
      view.dtheta = -0.02;
    } else if (e.keyCode == KEYS.right) { // pan right
      view.dtheta = 0.02;
    } else if (e.keyCode == KEYS.up) { // tilt up
      view.dphi = -0.02;
    } else if (e.keyCode == KEYS.down) { // tilt down
      view.dphi = 0.02;
    } else if (e.keyCode == KEYS.a ) { // strafe left
      camera.position.ps = -4;
    } else if (e.keyCode == KEYS.w ) { // forward
      camera.position.s = 4;
    } else if (e.keyCode == KEYS.d) { // strafe right
      camera.position.ps = 4;
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
      view.dtheta = 0;
    } else if (e.keyCode == KEYS.right) { // pan right
      view.dtheta = 0;
    } else if (e.keyCode == KEYS.up) { // tilt up
      view.dphi = 0;
    } else if (e.keyCode == KEYS.down) { // tilt down
      view.dphi = 0;
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

  function sphereToCartVector(theta, phi, current) {
    var coords = sphereToCart(theta, phi, 1);

    return new THREE.Vector3(coords.x + current.x, coords.y + current.y, coords.z + current.z);
  }
  
  function sphereToCart(theta, phi, r) {
    var x = r * Math.cos(theta) * Math.sin(phi);
    var y = r * Math.cos(phi); 
    var z = r * Math.sin(theta) * Math.sin(phi);
    return {
      x: x,
      y: y,
      z: z
    }
  }
});

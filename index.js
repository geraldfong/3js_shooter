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

  var players = {};

  var id;

  init();
  animate();
  serverCommunicate()

  function serverCommunicate() {
    id = "user_" + Math.floor(Math.random() * 10000);
    
    
    jQuery.get("http://geraldfong.com:3000/register", {
      id: id
    }, function(data, textStatus) {
      console.log(data, textStatus);
    });

    //pollServer()
  }

  function pollServer() {
    jQuery.get("http://geraldfong.com:3000", {
      id: id,
      coord: camera.position
    }, function(data, textStatus) {
      players = data.players;
    });
    setTimeout(pollServer, 1000);
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
    var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true });

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
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube2.rotation.x += 0.01;
    cube2.rotation.y += 0.01;
    for( var i = 0; i < beams.length; i++) {
      var beam = beams[i];
      beam.position.z += beam.position.dz;
      beam.position.x += beam.position.dx;
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

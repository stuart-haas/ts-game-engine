import { context, Canvas } from "./Canvas";
import { Player } from '@entity/Player';
import { Spawner } from './Spawner';
import { Map } from './Map';
import { Camera } from './Camera';
import { EntityManager } from './EntityManager';
import { Collision } from '@physics/Collision';
import { ONE } from './Level';
import { Entity } from '@entity/Entity';
import { Vector } from '@math/Vector';

export class Engine {

  public canvas: HTMLCanvasElement;
  public map: Map;
  public camera: Camera;
  public player: Player;
  public entityManager: EntityManager;
  public spawner: Spawner;

  private currentTime:number = 0;
  private lastTime:number = (new Date()).getTime();
  private delta:number = 0;
  private fps:number = 60;
  private interval:number = 1000 / this.fps;

  public constructor() {

    this.map = Map.getInstance();
    this.camera = Camera.getInstance();
    this.entityManager = EntityManager.getInstance();
    this.spawner = Spawner.getInstance();
    this.player = new Player();
  }

  public start(): void {

    this.canvas = Canvas.initialize();

    Canvas.WIDTH = this.canvas.width;
    Canvas.HEIGHT = this.canvas.height;

    this.map.generate(ONE);

    this.loop();
  }

  public loop(): void {

    window.requestAnimationFrame(this.loop.bind(this));

    this.currentTime = (new Date()).getTime();
    this.delta = (this.currentTime - this.lastTime);

    if(this.delta > this.interval) {
      
      context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
      context.save();
      
      this.camera.update(this.player.position);

      this.map.render();

      this.player.update();

      var neighbors = Vector.findInRadius(this.player.position, 64, 8, new Vector(this.map.tileSize / 2, this.map.tileSize / 2));
      this.map.renderNeighbors(neighbors);

      Collision.detect(this.player, this.map, 0, function(source: Entity, target: Entity, map: Map) {
        target.color = '#000';
        Collision.resolve(source, target, map);
      });
      
      this.spawner.update(this.player.position);

      this.entityManager.update(this.player.position); 

      this.player.render();

      this.lastTime = this.currentTime - (this.delta % this.interval);

      context.restore();
    }
  }

  public resize(): void {
    if(this.canvas !== undefined) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.outerHeight;
    }
  }
}
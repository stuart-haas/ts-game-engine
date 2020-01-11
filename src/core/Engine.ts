import { context, Canvas } from "./Canvas";
import { Player } from '@entity/Player';
import { Spawner } from './Spawner';
import { Map, LayerId } from '@core/Map';
import { Camera } from './Camera';
import { EntityManager } from './EntityManager';
import { Entity } from '@entity/Entity';
import { MapResource } from './Map';

export class Engine {

  public static FPS:number;

  public canvas:HTMLCanvasElement;
  public map:Map;
  public camera:Camera;
  public player:Entity;
  public entityManager:EntityManager;
  public spawner:Spawner;

  private currentTime:number = 0;
  private lastTime:number = (new Date()).getTime();
  private delta:number = 0;
  private fps:number = 60;
  private interval:number = 1000 / this.fps;
  private timer:number = Date.now();
  private frames:number = 0;

  public constructor() {
    this.map = Map.getInstance();
    this.camera = Camera.getInstance();
    this.entityManager = EntityManager.getInstance();
    this.spawner = Spawner.getInstance();
  }

  public start():void {

    const self = this;

    this.canvas = Canvas.initialize();

    Canvas.WIDTH = this.canvas.width;
    Canvas.HEIGHT = this.canvas.height;

    this.map.load([
      new MapResource("resources/tilemaps/Tilemap_Path Layer.csv", "resources/tilesets/tallgrass.png", LayerId.Path), 
      new MapResource("resources/tilemaps/Tilemap_Collision Layer.csv", "resources/tilesets/fence.png", LayerId.Collision)      
    ]).then(data => {
      self.ready();
    })
  }

  private ready():void {
    this.entityManager.addEntity(new Player());
    this.player = this.entityManager.getEntity(0);

    this.update();
  }

  public update():void {

    window.requestAnimationFrame(this.update.bind(this));

    this.currentTime = (new Date()).getTime();
    this.delta = (this.currentTime - this.lastTime);

    if(this.delta > this.interval) {
      
      context.clearRect(0, 0, Canvas.WIDTH, Canvas.HEIGHT);
      context.save();
      
      this.camera.update(this.player.position);

      this.map.render();

      this.entityManager.update();

      //this.spawner.update(this.player.position);

      this.frames ++;

      if(Date.now() - this.timer > 1000) {
        this.timer += 1000;
        Engine.FPS = this.frames;
        document.getElementById('fps').getElementsByClassName("value")[0].innerHTML = Engine.FPS.toString();
        this.frames = 0;
      }

      this.lastTime = this.currentTime - (this.delta % this.interval);

      context.restore();
    }
  }

  public resize():void {
    if(this.canvas !== undefined) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.outerHeight;
    }
  }
}
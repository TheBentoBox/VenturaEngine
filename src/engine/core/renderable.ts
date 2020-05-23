import { Transform } from "../math/transform";
import { IDestroyable } from "../interfaces/IDestroyable";

/**
 * The base class for an object which can be rendered.
 */
export abstract class Renderable implements IDestroyable {

    /**
     * The asset data attached to this renderable's container.
     */
    protected _internalAssetData!: PIXI.Container;

    /**
     * The container within to which this object's renderable objects are attached.
     */
    public readonly container: PIXI.Container;

    /**
     * The transform within its owning container used to render this object.
     */
    public readonly transform: Transform;

    /**
     * Stands up a new renderable.
     */
    public constructor() {
        this.container = new PIXI.Container();
        this.transform = new Transform();

        this.transform.position.onComponentChanged.subscribe(this, this.onPositionChanged.bind(this));
        this.transform.scale.onComponentChanged.subscribe(this, this.onScaleChanged.bind(this));
        this.transform.rotation.onComponentChanged.subscribe(this, this.onRotationChanged.bind(this));
    }

    /**
     * Unloads resources held by this renderable.
     */
    public destroy(): void {
        this.container.destroy();
        this.transform.destroy();
    }

    /**
     * Subscription callback for when our transform's position changes to update the internal one.
     */
    public onPositionChanged(): void {
        this.container.transform.position.x = this.transform.position.x;
        this.container.transform.position.y = this.transform.position.y;
    }

    /**
     * Subscription callback for when our transform's scale changes to update the internal one.
     */
    public onScaleChanged(): void {
        this.container.transform.scale.x = this.transform.scale.x;
        this.container.transform.scale.y = this.transform.scale.y;
    }

    /**
     * Subscription callback for when our transform's rotation changes to update the internal one.
     */
    public onRotationChanged(): void {
        this.container.transform.rotation = this.transform.rotation.z;
    }
}
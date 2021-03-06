import { ITickable } from "../interfaces/ITickable";

export abstract class Game implements ITickable {

    /**
     * The loaded game data which should be used to confgiure and run this game.
     */
    protected _gameData: any;

    /**
     * Whether or not the game is currently active.
     */
    public isActive: boolean;

    /**
     * Stands up a new game instance using the loaded game data.
     * @param gameData The gameData from the game config as loaded by the engine.
     */
    public constructor(gameData: any) {
        this._gameData = gameData;
        this.isActive = true;
    }

    /**
     * Performs update routines on the operating game class. This must exist here on the base class
     * so the engine can treat the game as tickable, but abstract isn't desireable as many games
     * likely won't need an update loop within the game class itself.
     * @param deltaTime The time that has passed since the last tick
     */
    // tslint:disable-next-line:no-empty
    public update(deltaTime: number): void { }

    /**
     * Triggers the game to save its current state in local storate.
     */
    public abstract saveGame(): void;

    /**
     * Triggers the game to restore itself from local storage.
     */
    public abstract restoreGame(): void;
}
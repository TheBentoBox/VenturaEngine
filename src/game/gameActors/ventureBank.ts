import { Actor, ActorData } from "../../engine/core/actor";
import { Observable } from "../../engine/core/observable";
import { TextComponent, TextFormatMode } from "../../engine/components/display/textComponent";
import { GameEvent } from "../gameEvents";
import { VentureBusiness, VentureBusinessData } from "./ventureBusiness";
import { ButtonData, Button } from "../../engine/actors/ui/button";
import { SpriteComponent } from "../../engine/components/display/spriteComponent";
import { Dictionary } from "../../engine/core/types";
import { Engine } from "../../engine/core/engine";

/**
 * The data that must be passed into the bank for it to function.
 */
interface VentureBankData extends ActorData {

    /**
     * The data to build on top of when generating the manager buttons.
     */
    baseManagerButtonData: ButtonData;

    /**
     * The array of business configs from the core game config.
     */
    businesses: VentureBusinessData[];
}

/**
 * The various purchase modes for businesses.
 * Each mode represents the number of businesses that would be purchased.
 */
export enum PurchaseMode {

    /**
     * Buying one business unit at a time.
     */
    ONE = 1,

    /**
     * Buying ten business units at a time.
     */
    TEN = 10,

    /**
     * Buying 100 business units at a time.
     */
    HUNDRED = 100,

    /**
     * Buying the maximum number of business units that the user can currently afford.
     */
    MAX = -1,
}

/**
 * A "bank" actor used to store currency and control purchasing with various display states.
 */
export class VentureBank extends Actor<VentureBankData> {

    /**
     * The internal balance.
     */
    public readonly balance: Observable<number>;

    /**
     * The current purchase mode of the game. Used to modify how many units of a business are purchased at once.
     */
    public readonly purchaseMode: Observable<PurchaseMode>;

    /**
     * The current global profit multiplier.
     */
    public readonly globalProfitMultiplier: Observable<number>;

    /**
     * A mapping of business names to the buttons associated with purchasing their manager.
     */
    public readonly managerButtons: Dictionary<Button>;

    /**
     * Instantiates a new bank with the given name.
     * @param actorData The data associated with this bank.
     */
    public constructor(actorData: VentureBankData) {
        super(actorData);
        this.purchaseMode = new Observable<PurchaseMode>(PurchaseMode.ONE);
        this.globalProfitMultiplier = new Observable<number>(1);
        this.balance = new Observable<number>(0);
        this.managerButtons = {};

        // Create the text component that will display the balance.
        const balanceText = new TextComponent({ name: "balanceText", text: this.balance, maxSize: { x: 415 }, format: TextFormatMode.CURRENCY });
        balanceText.setStyle(new PIXI.TextStyle({
            fill: 0xFFFFFF,
            fontSize: "64px",
            stroke: 0x888888,
            strokeThickness: 7
        }));
        balanceText.transform.position.set(10, 0);
        this.addDisplayComponent(balanceText);

        // Trigger an initial balance update and register business cycle completions to balance updates.
        this.balance.adjust(0);
        GameEvent.ON_CYCLE_COMPLETE.subscribe(this, (business: VentureBusiness) => { this.balance.adjust(business.profit); });

        this.createManagerButtons();
    }

    /**
     * Lays out the manager buttons along the left half of the screen once they've been loaded.
     * This fits them equally within the available space below the balance text.
     */
    public load(): void {
        super.load();
        const businesses = this._objectData.businesses;
        const balanceText = this.getDisplayComponent<TextComponent>("balanceText");

        // Start below the text. The available room is the remaining window height.
        const startingHeight = (balanceText.transform.position.y + balanceText.container.height);
        const availableRoom = (window.innerHeight - startingHeight);

        // Determine how much space each button can take up, and therefore what their scales should be.
        // We are assuming here that the businesses array is populated and that it has a manager button.
        // If that weren't the case, something has gone catastrophically wrong anyway.
        const heightPerButton = (availableRoom / businesses.length);
        const scaleFactor = (heightPerButton / this.managerButtons[businesses[0].name].container.height);

        // Lay out the buttons, beginning from the starting height below the balance text, calculated above.
        let spawnHeight = startingHeight;
        for (const business of businesses) {
            this.managerButtons[business.name].transform.scale.set(scaleFactor);
            this.managerButtons[business.name].transform.position.y = spawnHeight;
            spawnHeight += heightPerButton;
        }
    }

    /**
     * Saves the bank's data in local storage.
     */
    public save(): void {
        super.save();
        Engine.localStorage.setValue("Balance", this.balance.getValue());
        Engine.localStorage.setValue("GlobalProfitMultiplier", this.globalProfitMultiplier.getValue());
    }

    /**
     * Restores the bank's data in local storage.
     */
    public restore(): void {
        super.restore();
        this.balance.setValue(Engine.localStorage.getNumber("Balance", 0));
        this.globalProfitMultiplier.setValue(Engine.localStorage.getNumber("GlobalProfitMultiplier", 1));
    }

    /**
     * Iterates the business data and generates the manager buttons.
     */
    private createManagerButtons(): void {
        for (const business of this._objectData.businesses) {

            // On top of the provided base data, ensure the labels array exists
            // and specify the transform based on the array position.
            const managerButtonData: ButtonData = {
                ...this._objectData.baseManagerButtonData,
                name: business.name,
                labels: (this._objectData.baseManagerButtonData.labels ?? [])
            }

            // Instantiate the button, then attach the business's icon to it.
            const managerButton = new Button(managerButtonData);
            const iconSprite = new SpriteComponent({ name: `${business.name}ManagerIcon`, assetName: business.icon });
            managerButton.addDisplayComponent(iconSprite);

            // Add the title label specifying which manager is being purchased.
            managerButton.addDisplayComponent(new TextComponent({
                name: `${business.name}ManagerButton`,
                text: `Buy ${business.name} Manager`,
                style: {
                    fill: 0xFFFFFF
                },
                transform: {
                    position: {
                        x: 200,
                        y: 10
                    }
                }
            }));

            // Add a label specifying the price of the manager.
            managerButton.addDisplayComponent(new TextComponent({
                name: `${business.name}ManagerPrice`,
                format: TextFormatMode.CURRENCY,
                text: business.managerCost,
                style: {
                    fill: 0xFFFFFF,
                    fontSize: "24pt"
                },
                transform: {
                    position: {
                        x: 200,
                        y: 70
                    }
                }
            }));

            // Attach it and store it.
            this.managerButtons[business.name] = managerButton;
            this.addChild(managerButton);
        }
    }
}
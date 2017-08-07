import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as uuid from 'uuid';

@Injectable()
export class LocationService {
    constructor(private storage: Storage,
                private events: Events){
    }

    setLocation(location){
        debugger;
        location.id = uuid();
        this.storage.set(location.id, JSON.stringify(location));
        this.events.publish('locations:changed');
    }

    updateLocation(location){
        this.storage.set(location.id, JSON.stringify(location));
        this.events.publish('locations:changed');
    }

    getLocation(locationId){
        return this.storage.get(locationId).then((location) => {
            return JSON.parse(location)
        }, (error) => {
            return {};
        });
    }

    removeLocation(locationId){
        return this.storage.remove(locationId).then(() => {
            this.events.publish('locations:changed');
        });
    }

    isLocationPresent(locationName) {
        return this.storage.get(locationName).then((location) => {
            return !!location;
        }, (error) => {
            return null;
        });
    }

    getAllLocations(){
        return new Promise(resolve => {
            let results = [];
            this.storage.forEach(data => {
                results.push(JSON.parse(data));
            });
            return resolve(results);
        });
    }
}
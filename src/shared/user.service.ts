import { Injectable } from '@angular/core';
import { Events, Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import * as uuid from 'uuid';

@Injectable()
export class UserService {
    api: String;
    constructor(private events: Events,
                private storage: Storage,
                private uniqueDeviceID: UniqueDeviceID,
                private platform: Platform,
                private http: Http){

        this.api = 'http://192.168.1.153:3001/auth';
    }

    login(user){
        let payload = {
            phoneNumber: user.phoneNumber,
            password: user.password
        }

        // return new Promise((resolve, reject) => {
        //     window.setTimeout(() => {
        //         user.id = '12345';
        //         this.storage.set('user', JSON.stringify(user));
        //         this.events.publish('user:changed');
        //         resolve(user);
        //     }, 1000);
        // });

        let call = this.http.post(`${this.api}/login`, payload)
        call.subscribe((data) =>{
            debugger;
            console.log('loggedin user: ', data['_body']);
            this.storage.set('user', JSON.stringify(data['_body']));
        }, (error) => {
            console.log('User login error: ', error);
        });
    }

    verify(phoneNumber, verificationCode){
        let payload = {
            phoneNumber: phoneNumber,
            verificationCode: verificationCode
        };

        return new Promise((resolve, reject) => {
            window.setTimeout(() => {
                resolve({phoneNumber:phoneNumber, id: '12345'});
            }, 1000);
        });

        // let call = this.http.post(`${this.api}/verify`, payload)
        // call.subscribe((data) =>{
        //     console.log('verified user: ', data['_body']);
        //     this.storage.set('user', JSON.stringify(data['_body']));
        // }, (error) => {
        //     console.log('User registration error: ', error);
        // });
    }

    getPlatform(){
        return this.platform.is('android') ? 'android' : 'ios';
    }

    register(user){
        this.uniqueDeviceID.get()
        .then((uuid: any) => {
            user.deviceId = uuid;
            let payload = {
                phoneNumber:  user.phoneNumber,
                deviceId: uuid,
                platform: this.getPlatform(),
                password: user.password
            }

            // return new Promise((resolve, reject) => {
            //     window.setTimeout(() => {
            //         user.id = uuid();
            //         this.storage.set('user', JSON.stringify(user));
            //         this.events.publish('user:changed');
            //     }, 1000);
            // });

          // TO DO: TURN ON THE REAL APIS
          let call = this.http.post(`${this.api}/register`, payload)
          return call.subscribe((data) =>{
            debugger;
            console.log('registered user: ', data['_body']);
            this.storage.set('user', JSON.stringify(data['_body']));
          }, (error) => {
            console.log('User registration error: ', error);
          });

        })
        .catch((error: any) => console.log(error));
    }

    logout(){
        this.storage.remove('user');
        this.events.publish('user:changed');
    }

    getUser(){
        return this.storage.get('user').then((user) => {
            user = (user || '{}')
            return JSON.parse(user);
        }, (error) => {
            return {};
        });
    }

    updateUser(user){
        let call = this.http.put(`${this.api}/user`, user)
        call.subscribe((data) => {
            let savedUser = data['_body'];
            console.log('Saved user: ', savedUser);
            this.storage.set('user', JSON.stringify(user));
            this.events.publish('user:changed');
        }, (error) => {
            console.log('Failed to save user: ', error);
        });
    }
 }

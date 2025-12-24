import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(public http: HttpClient){}
  private url="http://localhost:3000/api/clients"

  // lister les clients 
  listclient(){
    return this.http.get(this.url+"/"+"findall");
  }
  updateClient(id: string, data: any){
    return this.http.put(`${this.url}/update/${id}`, data);
  }
  chercherclient(query:string){
    return this.http.get(`${this.url}/search?query=${encodeURIComponent(query)}`);
  }
  ajouterclient(data:any){
    return this.http.post(`${this.url}/add`,data)  
  }
}

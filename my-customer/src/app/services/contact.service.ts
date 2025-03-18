import { Injectable } from "@angular/core";
import { apiURL } from "./config";

export interface Contact {
    name: string,
    email: string,
    message: string
}
@Injectable({
    providedIn: 'root'
})
export class ContactService {

    async sendEmail(contact: Contact) {
        try {
            const response = await fetch(`${apiURL}/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contact),
            }); return response.json();
        }
        catch (err) {
            console.error(err);
        }
    }
}
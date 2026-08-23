import { Mistral } from "@mistralai/mistralai";

class Client {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    // return mistallal client
    getMistralClient() {
        return new Mistral({ apiKey: this.apiKey });
    }
}

export default Client;
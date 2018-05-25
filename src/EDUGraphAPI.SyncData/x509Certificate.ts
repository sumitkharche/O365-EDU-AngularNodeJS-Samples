/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

import * as forge  from 'node-forge';
import * as fs from 'fs';

export class X509Certificate {

    private pkcs12: any; 

    constructor(path: string, password: string) {
        this.pkcs12 = this.loadPkcs12(path, password)
    }
    
    getPrivateKey(): string {
        var keyBags = this.pkcs12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        var keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0]
        return forge.pki.privateKeyToPem(keyBag.key);
    }

    getThumbprint(): string {
        var certBags = this.pkcs12.getBags({ bagType: forge.pki.oids.certBag });
        var certBag = certBags[forge.pki.oids.certBag][0]
        var publicKey = forge.pki.certificateToAsn1(certBag.cert);
        var publicKeyDer = forge.asn1.toDer(publicKey);

        var sha1 = forge.md.sha1.create();
        sha1.update(publicKeyDer.bytes());
        return sha1.digest().toHex();
    }

    private loadPkcs12(path: string, password: string): void {
        var keyFile = fs.readFileSync(path, 'binary');
        var p12Asn1 = forge.asn1.fromDer(keyFile);
        return forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
    }
}
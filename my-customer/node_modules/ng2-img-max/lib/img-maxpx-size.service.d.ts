import { Observable } from 'rxjs';
import { ImgExifService } from './img-exif.service';
import { Ng2PicaService } from './ng2-pica.service';
import * as i0 from "@angular/core";
export declare class ImgMaxPXSizeService {
    private ng2PicaService;
    private imageExifService;
    timeAtStart: number;
    constructor(ng2PicaService: Ng2PicaService, imageExifService: ImgExifService);
    resizeImage(file: File, maxWidth: number, maxHeight: number, logExecutionTime?: boolean): Observable<any>;
    private logExecutionTime;
    static ɵfac: i0.ɵɵFactoryDeclaration<ImgMaxPXSizeService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ImgMaxPXSizeService>;
}

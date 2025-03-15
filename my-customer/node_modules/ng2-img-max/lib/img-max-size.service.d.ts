import { Observable } from 'rxjs';
import { ImgExifService } from './img-exif.service';
import * as i0 from "@angular/core";
export declare class ImgMaxSizeService {
    private imageExifService;
    timeAtStart: number;
    initialFile: File | undefined;
    constructor(imageExifService: ImgExifService);
    compressImage(file: File, maxSizeInMB: number, ignoreAlpha?: boolean, logExecutionTime?: boolean): Observable<any>;
    private getCompressedFile;
    private getResultFile;
    private generateResultFile;
    private blobToFile;
    private getCalculatedQuality;
    private checkCompressionStatus;
    private isImgUsingAlpha;
    private logExecutionTime;
    static ɵfac: i0.ɵɵFactoryDeclaration<ImgMaxSizeService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ImgMaxSizeService>;
}

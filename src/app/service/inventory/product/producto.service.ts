import { HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient, ALAIN_I18N_TOKEN } from '@delon/theme';
import { IMessageResponse, IPaginateResponse, MessageResponseSchema } from '@service/schemas/index';
import { BACKEND_API, get_paginate_params_from_page } from '@shared/constant';
import { serviceDefault } from '@shared/pipes';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, Observable } from 'rxjs';

import {
  ProductoGridPaginateResponseSchema,
  IProductoGrid,
  IProducto,
  IProductoTipoSelector,
  ProductoTipoSelectorPaginateResponseSchema,
  IProductoMarcaSelector,
  ProductoMarcaSelectorPaginateResponseSchema,
  ProductoPaginateResponseSchema,
  ProductoSchema,
  ISingleProductoImg,
  SingleProductoImgSchema,
  IProductoImgUploadDto,
  ProductoImgUploadDtoSchema,
  IProductoImg,
  ProductoImgSchema,
  SingleProductoImgResponseSchema,
  ISingleProductoImgResponse,
  IPartialProductoImg,
  PartialProductoImgSchema,
  IAssociateProductoImg,
  AssociateProductoImgSchema,
  ICreateProductoDto,
  CreateProductoDtoSchema,
  IUpdateProductoDto,
  UpdateProductoDtoSchema,
  IProductoAll,
  ProductoAllSchema,
  IProductoTipo,
  IProductoTipoCreate,
  ProductoTipoCreateSchema,
  ProductoTipoSchema,
  IProductoSelector,
  ProductoSelectorSchema
} from './schemas/index';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(_HttpClient);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly msg = inject(NzMessageService);

  logger = { error: (_: any) => this.msg.error(_) };

  /**
   * ========================================
   * CRUD
   * ========================================
   */

  getProductsGrid(page: number = 1, page_size: number = 10): Observable<IPaginateResponse<IProductoGrid>> {
    let params = new HttpParams();
    if (page) {
      params = params.set('page', page);
    }
    if (page_size) {
      params = params.set('page_size', page_size);
    }

    return this.http.get<IPaginateResponse<IProductoGrid>>(BACKEND_API.inventory.product.grid.url(), { params }).pipe(
      serviceDefault({
        schema: ProductoGridPaginateResponseSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  getProductos(page: number = 1, page_size: number = 10): Observable<IPaginateResponse<IProducto>> {
    return this.http
      .get<IPaginateResponse<IProducto>>(BACKEND_API.inventory.product.url(), { params: get_paginate_params_from_page(page, page_size) })
      .pipe(
        serviceDefault({
          schema: ProductoPaginateResponseSchema,
          i18nErrorMessage: this.i18n.getI18Value('services.error'),
          logger: this.logger
        })
      );
  }
  getProductoSelector(): Observable<IProductoSelector[]> {
    return this.http.get<IProductoSelector[]>(BACKEND_API.inventory.product.selector.url()).pipe(
      serviceDefault({
        schema: ProductoSelectorSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  getProducto(id: number): Observable<IProducto> {
    if (!id) {
      throw new Error(this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del producto'));
    }

    return this.http.get<IProducto>(BACKEND_API.inventory.product.url(id)).pipe(
      serviceDefault({
        schema: ProductoSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  getProductoComplete(id: number): Observable<IProductoAll> {
    if (!id) {
      throw new Error(this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del producto'));
    }

    return this.http.get<IProductoAll>(BACKEND_API.inventory.product.view.url(id)).pipe(
      serviceDefault({
        schema: ProductoAllSchema.passthrough(),
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  deleteProducto(id: number): Observable<void> {
    return this.http.delete<void>(BACKEND_API.inventory.product.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  updateProducto(id: number, producto: IUpdateProductoDto): Observable<IProducto> {
    producto = UpdateProductoDtoSchema.parse(producto);
    return this.http.patch<IProducto>(BACKEND_API.inventory.product.url(id), producto).pipe(
      serviceDefault({
        schema: ProductoSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product.update.error'),
        logger: this.logger
      })
    );
  }

  createProducto(product: ICreateProductoDto): Observable<IProducto> {
    product = CreateProductoDtoSchema.parse(product);
    return this.http.post<IProducto>(BACKEND_API.inventory.product.url(), product).pipe(
      serviceDefault({
        schema: ProductoSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product.create.error'),
        logger: this.logger
      })
    );
  }

  getProductoTipoSelector(): Observable<IPaginateResponse<IProductoTipoSelector>> {
    return this.http.get(BACKEND_API.inventory.producto_tipo.selector.url()).pipe(
      serviceDefault({
        schema: ProductoTipoSelectorPaginateResponseSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }

  getProductoMarcaSelector(): Observable<IPaginateResponse<IProductoMarcaSelector>> {
    return this.http.get(BACKEND_API.inventory.producto_marca.selector.url()).pipe(
      serviceDefault({
        schema: ProductoMarcaSelectorPaginateResponseSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  getProductoImg(id: number): Observable<ISingleProductoImgResponse> {
    if (!id) {
      throw new Error(this.i18n.getI18ValueTemplate('msg.validation.isRequired', 'Id del producto'));
    }

    return this.http.get<ISingleProductoImgResponse>(BACKEND_API.inventory.product.img.url(id)).pipe(
      serviceDefault({
        schema: SingleProductoImgResponseSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  uploadProductoImg(params: IProductoImgUploadDto): Observable<HttpEvent<ISingleProductoImg>> {
    const { imagen, producto, is_cover, is_temp } = ProductoImgUploadDtoSchema.parse(params);
    const formData = new FormData();
    formData.append('imagen', imagen);

    if (producto !== undefined && producto !== null) {
      formData.append('producto', producto.toString());
    }
    if (is_cover !== undefined && is_cover !== null) {
      formData.append('is_cover', is_cover.toString());
    }
    if (is_temp !== undefined && is_temp !== null) {
      formData.append('is_temp', is_temp.toString());
    }

    return this.http
      .request<ISingleProductoImg>('POST', BACKEND_API.inventory.producto_img.url(), {
        body: formData,
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        serviceDefault({
          schema: SingleProductoImgSchema,
          i18nErrorMessage: this.i18n.getI18Value('services.error'),
          logger: this.logger
        })
      );
  }

  updateProductoImg(productoImg: IPartialProductoImg): Observable<IProductoImg> {
    const { id } = PartialProductoImgSchema.parse(productoImg);
    return this.http.patch<IProductoImg>(BACKEND_API.inventory.producto_img.url(id), productoImg).pipe(
      serviceDefault({
        schema: ProductoImgSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  associateProductoImg(params: IAssociateProductoImg): Observable<IMessageResponse> {
    params = AssociateProductoImgSchema.parse(params);

    return this.http.post<IMessageResponse>(BACKEND_API.inventory.producto_img.associate_with_product.url(), params).pipe(
      serviceDefault({
        schema: MessageResponseSchema,
        i18nErrorMessage: this.i18n.getI18Value('services.error'),
        logger: this.logger
      })
    );
  }

  deleteProductoImg(id: number): Observable<any> {
    return this.http.delete(BACKEND_API.inventory.producto_img.url(id)).pipe(
      serviceDefault({
        i18nErrorMessage: this.i18n.getI18Value('services.producto_img.delete.error'),
        logger: this.logger
      })
    );
  }

  /**
   * ========================================
   * OPERATIONS
   * ========================================
   */
  search(query = ''): Observable<IProducto[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<IProducto[]>(BACKEND_API.inventory.product.search.url(), params).pipe(
      serviceDefault({
        schema: ProductoSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }

  getProductsByIds(ids: number[]): Observable<IProducto[]> {
    return this.http.post<IProducto[]>(BACKEND_API.inventory.product.get_by_ids.url(), { ids }).pipe(
      serviceDefault({
        schema: ProductoSchema.array(),
        i18nErrorMessage: this.i18n.getI18Value('services.product_type.get.error'),
        logger: this.logger
      })
    );
  }
}

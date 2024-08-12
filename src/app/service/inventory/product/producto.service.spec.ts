import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BACKEND_API } from '@shared/constant';

import { ProductService } from './producto.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve data from the API via GET', () => {
    const dummyData = {
      next: BACKEND_API.inventory.product.grid.url().concat('?cursor=cD0yMDI0LTA2LTI3KzAzJTNBMDglM0ExMi43NTg3NTElMkIwMCUzQTAw'),
      previous: null,
      results: [
        {
          id: 51,
          nombre: 'Gently Used Granite Chicken',
          tipo: 'Health',
          sku: 'SKU-ZSV73X',
          cover: 'https://picsum.photos/id/562/300/300'
        }
      ]
    };

    service.getProductsGrid().subscribe(data => {
      console.log(data);
    });

    const req = httpMock.expectOne(BACKEND_API.inventory.product.grid.url());
    expect(req.request.method).toBe('GET');
    req.flush(dummyData);
  });
});

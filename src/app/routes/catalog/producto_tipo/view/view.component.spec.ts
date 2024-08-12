import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogProductoTipoViewComponent } from './view.component';

describe('CatalogProductoTipoViewComponent', () => {
  let component: CatalogProductoTipoViewComponent;
  let fixture: ComponentFixture<CatalogProductoTipoViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogProductoTipoViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogProductoTipoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

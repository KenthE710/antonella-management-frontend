import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogProductoTipoComponent } from './producto-tipo.component';

describe('CatalogProductoTipoComponent', () => {
  let component: CatalogProductoTipoComponent;
  let fixture: ComponentFixture<CatalogProductoTipoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogProductoTipoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogProductoTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

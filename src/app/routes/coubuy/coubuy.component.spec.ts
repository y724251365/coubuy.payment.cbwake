import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoubuyComponent } from './coubuy.component';

describe('CoubuyComponent', () => {
  let component: CoubuyComponent;
  let fixture: ComponentFixture<CoubuyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoubuyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoubuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

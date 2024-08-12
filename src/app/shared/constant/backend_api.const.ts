import { HttpParams } from '@angular/common/http';
import { log } from '@delon/util';
import { environment } from '@env/environment';
import { z } from 'zod';

const HOST = environment.backend.host;
const API = {
  inventory: (model: string, version: string) => `${HOST}/inventario/api/${version}/${model}/`,
  customers: (model: string, version: string) => `${HOST}/customers/api/${version}/${model}/`,
  staff: (model: string, version: string) => `${HOST}/staff/api/${version}/${model}/`,
  services: (model: string, version: string) => `${HOST}/services/api/${version}/${model}/`,
  parameters: (model: string, version: string) => `${HOST}/parameters/api/${version}/${model}/`,
  users: (model: string, version: string) => `${HOST}/users/api/${version}/${model}/`
};

export function get_paginate_params_from_page(page: number = 1, page_size: number = 10): HttpParams {
  let params = new HttpParams();

  z.number().positive().parse(page);
  z.number().positive().parse(page_size);

  const limit = page_size;
  const offset = --page * limit;

  params.set('limit', limit);
  params.set('offset', offset);

  return params;
}

export const BACKEND_API = {
  inventory: {
    product: {
      url: (id?: number) => {
        let url = API.inventory('producto', 'v1');
        if (id) {
          url = url.concat(`${id}/`);
        }
        return url;
      },
      grid: {
        url: () => API.inventory('producto', 'v1').concat('grid/')
      },
      img: {
        url: (id?: number) => {
          let url = API.inventory('producto', 'v1');
          if (id) {
            url = url.concat(`${id}/`);
          }
          return url.concat('img/');
        }
      },
      view: {
        url: (id: number) => {
          let url = API.inventory('producto', 'v1');
          if (id) {
            url = url.concat(`${id}/`);
          }
          return url.concat('view/');
        }
      },
      selector: {
        url: () => API.inventory('producto', 'v1').concat('selector/')
      },
      search: {
        url: () => API.inventory('producto', 'v1').concat('search/')
      },
      get_by_ids: {
        url: () => API.inventory('producto', 'v1').concat('get_by_ids/')
      }
    },
    producto_tipo: {
      url: (id?: number) => {
        const url = API.inventory('producto_tipo', 'v1');
        if (id) {
          return url.concat(`${id}/`);
        }
        return url;
      },
      version: 'v1',
      selector: {
        url: () => API.inventory('producto_tipo', 'v1').concat('selector/')
      },
      grid: {
        url: () => API.inventory('producto_tipo', 'v1').concat('grid/')
      }
    },
    producto_marca: {
      url: (id?: number) => {
        const url = API.inventory('producto_marca', 'v1');
        if (id) {
          return url.concat(`${id}/`);
        }
        return url;
      },
      version: 'v1',
      selector: {
        url: () => API.inventory('producto_marca', 'v1').concat('selector/')
      },
      grid: {
        url: () => API.inventory('producto_marca', 'v1').concat('grid/')
      }
    },
    producto_img: {
      url: (id?: number) => {
        let url = API.inventory('producto_img', 'v1');
        if (id) {
          url = url.concat(`${id}/`);
        }
        return url;
      },
      associate_with_product: {
        url: () => API.inventory('producto_img', 'v1').concat(`associate-with-product/`)
      }
    },
    stats: {
      total_productos_por_tipo: {
        url: () => API.inventory('stats', 'v1').concat('total_productos_por_tipo/')
      },
      productos_por_marca: {
        url: () => API.inventory('stats', 'v1').concat('productos_por_marca/')
      },
      valor_inventario: {
        url: () => API.inventory('stats', 'v1').concat('valor_inventario/')
      },
      productos_mas_utilizados: {
        url: () => API.inventory('stats', 'v1').concat('productos_mas_utilizados/')
      }
    },
    lote: {
      url: (id?: number) => {
        let url = API.inventory('lote', 'v1');
        if (id) {
          url = url.concat(`${id}/`);
        }
        return url;
      },
      grid: {
        url: () => API.inventory('lote', 'v1').concat('grid/')
      },
      view: {
        url: (id: number) => API.inventory('lote', 'v1').concat(`${id}/`).concat('view/')
      }
    }
  },
  customers: {
    cliente: {
      url: (id?: number) => {
        let url = API.customers('cliente', 'v1');
        if (id) {
          url = url.concat(`${id}/`);
        }
        return url;
      },
      grid: {
        url: () => API.customers('cliente', 'v1').concat('grid/')
      },
      selector: {
        url: () => API.customers('cliente', 'v1').concat('selector/')
      }
    }
  },
  staff: {
    personal: {
      url: (id?: number) => {
        let url = API.staff('personal', 'v1');
        if (id) {
          url = url.concat(`${id}/`);
        }
        return url;
      },
      grid: {
        url: () => API.staff('personal', 'v1').concat('grid/')
      },
      search: {
        url: () => API.staff('personal', 'v1').concat('search/')
      }
    }
  },
  services: {
    servicio: {
      url: (id?: number) => {
        let url = API.services('servicio', 'v1');
        if (id) {
          url = url.concat(`${id}/`);
        }
        return url;
      },
      grid: {
        url: () => API.services('servicio', 'v1').concat('grid/')
      },
      selector: {
        url: () => API.services('servicio', 'v1').concat('selector/')
      }
    },
    servicio_realizado: {
      url: (id?: number) => {
        let url = API.services('servicio_realizado', 'v1');
        if (id) {
          url = url.concat(`${id}/`);
        }
        return url;
      },
      complete: {
        url: (id: number) => API.services('servicio_realizado', 'v1').concat(`${id}/complete/`)
      },
      grid: {
        url: () => API.services('servicio_realizado', 'v1').concat('grid/')
      }
    },
    servicio_realizado_producto: {
      url: (id?: number) => {
        let url = API.services('servicio_realizado_producto', 'v1');
        if (id) {
          url = url.concat(`${id}/`);
        }
        return url;
      },
      by_servicio_realizado: {
        url: (id: number) => API.services('servicio_realizado_producto', 'v1').concat(`by_servicio_realizado/${id}/`)
      }
    }
  },
  parameters: {
    parametro: {
      url: (id?: number) => {
        let url = API.parameters('parametro', 'v1');
        if (id) {
          url = url.concat(`${id}/`);
        }
        return url;
      }
    }
  },
  users: {
    login: {
      url: () => API.users('login', 'v1')
    },
    token: {
      refresh: {
        url: () => API.users('token/refresh', 'v1')
      }
    }
  }
};

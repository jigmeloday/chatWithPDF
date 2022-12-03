// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { environment } from '../../../../../apps/know-me/src/environments/environment';
import { APIResponse, Methods } from '../base-model/base.model';
import toast from 'react-hot-toast';

const baseUrl = environment.NX_BASE_URL;

export const FetchAPI = async <T>( url: string, method: Methods, init?: RequestInit ): Promise<APIResponse<T>> => {
  return window.fetch( `${baseUrl}/${url}`, {
    method,
    ...init,
    credentials: 'include',
    headers: {
      'accept-language': 'en',
    }
  } ).then( async response => {
    if ( response.ok || response.status < 400 ) {
      const json = await response.json();
      return { data: json };
    }
    // convert non-2xx HTTP responses into errors:
    const json = await response.json();
    toast.error( json.error || json.errors[0]  );
    return Promise.resolve( { error: json } );
  } ).catch( response => {
    return Promise.resolve( { error: { errors: [response?.toString()] } } );
  } );
};

export default function ({ store, redirect }){
  if(!store.$cookies.get("token")){
    //return redirect('/login');

    const inBrowser = typeof window !== 'undefined';
    if( inBrowser){
      window.location.replace('/login');
    }
    else {
      return redirect('/login');
    }
    
  }
}

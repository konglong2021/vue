export default function ({ store, redirect }){
  if(!store.$cookies.get("token")){
    if(typeof window !== 'undefined'){
      window.location.replace('/login');
    }
    else {
      return redirect('/login');
    }

  }
}

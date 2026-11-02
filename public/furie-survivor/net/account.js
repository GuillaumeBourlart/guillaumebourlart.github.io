import {apiURL} from './endpoints.js';
export {apiURL} from './endpoints.js';
const messages={
  'auth/invalid-credential':'E-mail ou mot de passe incorrect.',
  'auth/email-already-in-use':'Cet e-mail possède déjà un compte. Connecte-toi pour le retrouver.',
  'auth/weak-password':'Choisis un mot de passe d’au moins 8 caractères.',
  'auth/popup-closed-by-user':'Connexion Google annulée.',
  'auth/popup-blocked':'Autorise la fenêtre Google dans ton navigateur.',
  'auth/unauthorized-domain':'Ce domaine doit être autorisé dans Firebase Authentication.',
  'auth/too-many-requests':'Trop de tentatives. Réessaie dans quelques minutes.',
  'auth/network-request-failed':'La connexion à Firebase est indisponible.',
  'auth/credential-already-in-use':'Cette connexion appartient déjà à un autre compte. Connecte-toi à celui-ci pour retrouver sa carrière.',
  'auth/requires-recent-login':'Reconnecte-toi avant de lier cette méthode.'
};
export async function createAccount({onChange=()=>{},onStatus=()=>{}}={}){
  const response=await fetch(apiURL('api/config'),{signal:AbortSignal.timeout(8000)});if(!response.ok)throw new Error('Le serveur de comptes est indisponible.');
  const config=await response.json(),sdk=await import('../vendor/firebase-client.js'),auth=sdk.getAuth(sdk.initializeApp(config.firebase));
  auth.languageCode='fr';let pending=null,loaded=false;
  const provider=new sdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
  const account={get user(){return auth.currentUser;},get loaded(){return loaded;},get providers(){return auth.currentUser?.providerData.map(p=>p.providerId)||[];},
    async token(force=false){if(!auth.currentUser)throw new Error('Connecte-toi pour jouer en ligne.');return auth.currentUser.getIdToken(force);},
    async request(path,data){const token=await account.token(),response=await fetch(apiURL(path),{method:data?'POST':'GET',headers:{Authorization:'Bearer '+token,...(data?{'Content-Type':'application/json'}:{})},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(12000)});const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Le serveur est indisponible.');return result;},
    async google(){
      try{if(auth.currentUser)await sdk.linkWithPopup(auth.currentUser,provider);else await sdk.signInWithPopup(auth,provider);onStatus('Compte Google connecté.');onChange(auth.currentUser);}
      catch(error){if(error.code==='auth/account-exists-with-different-credential'){pending=sdk.GoogleAuthProvider.credentialFromError(error);throw new Error('Cet e-mail possède déjà une carrière. Connecte-toi avec son mot de passe : Google sera ensuite lié au même compte.');}throw new Error(messages[error.code]||'Connexion Google impossible.');}
    },
    async password(email,password,create=false){
      if(!email||password.length<8)throw new Error('Indique ton e-mail et un mot de passe d’au moins 8 caractères.');
      try{
        if(auth.currentUser){if(auth.currentUser.email?.toLowerCase()!==email.toLowerCase())throw new Error('Utilise l’e-mail de ton compte actuel.');await sdk.linkWithCredential(auth.currentUser,sdk.EmailAuthProvider.credential(email,password));}
        else if(create){const result=await sdk.createUserWithEmailAndPassword(auth,email,password);sdk.sendEmailVerification(result.user).catch(()=>{});}
        else await sdk.signInWithEmailAndPassword(auth,email,password);
        if(pending){await sdk.linkWithCredential(auth.currentUser,pending);pending=null;onStatus('Google et le mot de passe ouvrent maintenant la même carrière.');}
        onChange(auth.currentUser);
      }catch(error){throw new Error(messages[error.code]||error.message||'Connexion impossible.');}
    },
    async reset(email){if(!email)throw new Error('Indique d’abord ton adresse e-mail.');try{await sdk.sendPasswordResetEmail(auth,email);onStatus('Si ce compte existe, un e-mail de réinitialisation va arriver.');}catch(error){throw new Error(messages[error.code]||'Envoi impossible.');}},
    async logout(){pending=null;await sdk.signOut(auth);}
  };
  sdk.onAuthStateChanged(auth,user=>{loaded=true;onChange(user);},()=>onStatus('Impossible de lire la connexion Firebase.'));
  return account;
}

/* ===== events-boot.js — scroll-reveal setup, bindEvents() orchestrator, admin session restore, initial data load ===== */
let revealObserver = null;
function setupScrollReveal(){
  if(revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('in'); revealObserver.unobserve(entry.target); }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObserver.observe(el));
}
window.addEventListener('scroll', ()=>{
  const header = document.querySelector('.site-header');
  if(header) header.classList.toggle('scrolled', window.scrollY > 30);
}, {passive:true});

function bindEvents(){
  bindShopEvents();
  bindAdminEvents();
}

async function restoreRememberedAdmin(){
  try{
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const user = sessionData && sessionData.session && sessionData.session.user;
    if(!user) return;

    const { data: adminData, error } = await supabaseClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if(error || !adminData){
      try{ localStorage.removeItem('blossom_admin_remember'); }catch(e){}
      return;
    }

    state.adminAuthed=true;
    state.currentAdminEmail = user.email || '';
    state.view='admin';
    refreshOrders();
    render();
  }catch(e){
    console.error('restore remembered admin error:', e);
  }
}

loadData().then(restoreRememberedAdmin);

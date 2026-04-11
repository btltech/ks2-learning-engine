// Diagnostic: Check Quiz Battle State
// Run this in browser console when on the Quiz Battle page

(function checkQuizBattleState() {
  console.log('=== QUIZ BATTLE DIAGNOSTIC ===\n');
  
  // Check localStorage for battles
  const battleHistory = localStorage.getItem('ks2_battle_history');
  if (battleHistory) {
    try {
      const history = JSON.parse(battleHistory);
      console.log('📊 Battle History:', history.length, 'battles');
      if (history.length > 0) {
        console.log('   Last battle:', history[0]);
      }
    } catch (e) {
      console.error('❌ Failed to parse battle history:', e);
    }
  } else {
    console.log('📊 Battle History: None');
  }
  
  // Check Firebase connection
  console.log('\n🔥 Checking Firebase...');
  console.log('   Database URL:', 'https://ks2-learning-engine-default-rtdb.europe-west1.firebasedatabase.app');
  
  // Check if user is logged in
  const user = localStorage.getItem('ks2_user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('\n👤 User:', userData.name || userData.id);
      console.log('   User ID:', userData.id);
    } catch (e) {
      console.error('❌ Failed to parse user:', e);
    }
  } else {
    console.log('\n👤 User: Not logged in');
  }
  
  // Check environment variables
  console.log('\n🔧 Environment Check:');
  console.log('   Running in:', window.location.origin);
  
  console.log('\n✅ Diagnostic complete');
  console.log('\nTo test battle creation manually:');
  console.log('1. Open Quiz Battle from the menu');
  console.log('2. Check console for [QuizBattle] and [RealtimeBattle] logs');
  console.log('3. Try "Practice with MiRa" button');
  console.log('4. Watch for errors in this console');
})();

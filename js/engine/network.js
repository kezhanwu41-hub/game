/**
 * network.js — 用於處理前端與 Node.js 伺服器的 Socket.IO 連線
 */
window.NetworkEngine = (function() {
  'use strict';
  
  let socket = null;
  let isMultiplayer = false;
  let playerRole = null; // 'player1' or 'player2'
  let roomId = null;
  
  // 記錄對手的狀態，等待雙方完成
  let opponentReady = false;
  let opponentData = null;

  function init() {
    // 只有當 window.io 存在（代表伺服器運行且載入 library）才啟動
    if (typeof io !== 'undefined') {
      // 假設 Server 跑在同一台機器且端口為 7892
      const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                        ? 'http://localhost:7892' 
                        : window.location.origin;
      socket = io(serverUrl);
      
      socket.on('connect', () => {
        console.log('[Network] Connected to server', socket.id);
      });

      socket.on('match_found', (data) => {
        console.log('[Network] Match found!', data);
        isMultiplayer = true;
        roomId = data.roomId;
        playerRole = data.role; // player1 always goes first = Player. player2 = Enemy.
        
        Game.showToast('✅ 成功配對對手！遊戲即將開始');
        setTimeout(() => {
          Game.onMultiplayerMatchStarted(playerRole);
        }, 1500);
      });

      socket.on('opponent_action', (payload) => {
        console.log('[Network] Received action from opponent:', payload.type);
        handleOpponentAction(payload);
      });

      socket.on('opponent_disconnected', () => {
        Game.showToast('⚠️ 對手已斷線！');
        Game.returnLobby();
        isMultiplayer = false;
      });
    }
  }

  function handleOpponentAction(payload) {
    if (!Game.isMultiplayerGame()) return;
    
    switch (payload.type) {
      case 'ban':
        Game.applyOpponentBan(payload.cardId);
        break;
      case 'pick':
        Game.applyOpponentPick(payload.cardId);
        break;
      case 'deploy':
        Game.applyOpponentDeploy(payload.field);
        break;
      case 'cmd':
        Game.applyOpponentCommand(payload.cmd);
        break;
    }
  }

  let matchmakingTimer = null;

  function joinMatchmaking() {
    if (!socket) return false;
    socket.emit('join_matchmaking');

    // 10 秒內未配對 → 自動切換 AI 對手
    clearTimeout(matchmakingTimer);
    matchmakingTimer = setTimeout(() => {
      if (!isMultiplayer) {
        console.log('[Network] 10 秒無人配對，切換 AI 模式');
        isMultiplayer = false;
        Game.onMatchmakingTimeout();
      }
    }, 10000);
    return true;
  }

  // ── 房間代碼系統 ──────────────────────────────────────────────
  function createRoom(code) {
    if (!socket) return false;
    socket.emit('create_room', { code });

    socket.once('room_created', (data) => {
      console.log('[Network] 房間已建立：', data.code);
      Game.showToast(`✅ 房間 ${data.code} 已建立，等待對手加入...`);
    });

    socket.once('room_ready', (data) => {
      clearTimeout(matchmakingTimer);
      isMultiplayer = true;
      roomId = data.roomId;
      playerRole = data.role;
      Game.showToast('✅ 對手已加入！遊戲即將開始');
      setTimeout(() => Game.onMultiplayerMatchStarted(playerRole), 1500);
    });

    socket.once('room_error', (data) => {
      Game.showToast(`❌ ${data.msg}`);
    });

    return true;
  }

  function joinRoom(code) {
    if (!socket) return false;
    socket.emit('join_room', { code });

    socket.once('room_ready', (data) => {
      clearTimeout(matchmakingTimer);
      isMultiplayer = true;
      roomId = data.roomId;
      playerRole = data.role;
      Game.showToast('✅ 成功加入房間！遊戲即將開始');
      setTimeout(() => Game.onMultiplayerMatchStarted(playerRole), 1500);
    });

    socket.once('room_error', (data) => {
      Game.showToast(`❌ ${data.msg}`);
    });

    return true;
  }

  function sendAction(type, data) {
    if (!socket || !isMultiplayer) return;
    const payload = { type, ...data };
    socket.emit('game_action', payload);
  }

  function disconnect() {
    clearTimeout(matchmakingTimer);
    if (socket) {
      socket.disconnect();
      isMultiplayer = false;
      roomId = null;
      playerRole = null;
    }
  }

  function getRole() { return playerRole; }
  function isConnected() { return isMultiplayer; }

  return { init, joinMatchmaking, createRoom, joinRoom, sendAction, disconnect, getRole, isConnected };
})();

/*	VirjsBot
 *	
 *	21/04/2014 - 
 * 	
 *	Agradecimentos: pessoal da Balada dos Virjs e amigos
 */

var VB = new Object();

VB['tools'] = new Object();
VB['tools']['privado'] 		= true;
VB['tools']['inicio'] 		= new Date();
VB['tools']['idSala'] 		= window.location.pathname.replace('/', '').replace('/', '');
VB['tools']['maiorQueZero'] 	= function(val){ return !isNaN(val) && val > 0; };
VB['tools']['maiorMenorIgual'] 	= function(val, menor, maior) {	return !isNaN(val) && val >= menor && val <= maior; };
VB['tools']['menorIgualaZero'] 	= function(val){ return !VB.tools.maiorQueZero(val); };
VB['tools']['isOff'] 		= function(val) {	return val.toLowerCase() == 'off' || ( !isNaN(val) && val <= 0 ); };
VB['tools']['getUserID'] 	= function(nick) {
					if ( nick == null )
						return -1;
									
					var usuarios 	= API.getUsers();
	
					for (var i in usuarios ) {
						if (nick == usuarios[i].username )
							return usuarios[i].id;
					}
								
					return -1;
				};
				
VB['tools']['getNickUserByMention']	= function(inicio, array){
						if ( array.length <= inicio )
							return null;
											
						var user 	= array[inicio];

						for (var x = inicio+1; x < array.length; x++)
							user += " " + array[x];
										
						return user.substring(1);
					};
									
VB['tools']['getIDUserByMention'] 	= function(inicio, array, data){
						var id = null;

						id = VB.tools.getUserID(VB.tools.getNickUserByMention(inicio, array));
						if ( id == -1 ){
							if ( data == null || data == false){
								API.sendChat('Não encontrei esse usuário!');
							}else{
								id = data.uid;
							}
						}
						return id;
					};
									
VB['tools']['getTimeString'] 	= function (segundos) {
					var v = [[2592000, 604800, 86400, 3600, 60], [' mes ', ' sem ', ' d ', ' h ', ' min ', ' seg']],
					str = '';
				
					for ( var i = 0; i < v[0].length; i++){
						cont=0;
						while ( segundos >= v[0][i] ){
							cont++;
							segundos -= v[0][i];
						}
						if ( cont > 0 )	
							str += cont + v[1][i];
					}
					if ( segundos > 0 )
						str += segundos + v[1][v[1].length-1];
					
					return str;
				};

VB['tools']['getUserMentionAndSender'] 	= function(data, inicio, array){
						var retorno = new Object();
										
						retorno['from'] = data.un;
											
						if ( inicio == null || array == null ){
							retorno['to'] = null;
						}
						else{
							retorno['to'] = VB.tools.getIDUserByMention(inicio, array);
							
							if ( retorno['to'] != -1 )
								retorno['to'] = API.getUser(retorno['to']).username;
						}
						return retorno;
					};

VB['tools']['post'] 	= function(metodo, tipo, parametros, sucesso, parsucesso){
				$.ajax({
					type: metodo.toUpperCase(),
					url: 'https://plug.dj/_/' + tipo,
					contentType: 'application/json',
					data: parametros }
				).done(function( msg ) {
					if ( sucesso != null ){
						if ( parsucesso == null )
							sucesso(msg);
						else
							sucesso(msg, parsucesso);
					}
				});
			};

VB['tools']['addDJ'] 	= function(id, func){
				VB.tools.post('POST', 'booth/add', '{"id": ' + id + '}', func);
			};

VB['tools']['remDJ']	= function(id, func){
				VB.tools.post('DELETE', 'booth/remove/' + id, null, func);
			};

VB['tools']['moveDJ']	= function(id, pos, func){
				VB.tools.post('POST', 'booth/move', '{"userID":"' + id + '","position":' + pos + '}', func);
			};
			

VB['tools']['addAndMoveDJ']	= function(id, pos){
					VB.tools.addDJ(id, function(msg){VB.tools.moveDJ(id, pos);});
				};

VB['tools']['aspas']	= function(str){
				return str.replace("'", "\\'").replace('"', '\\"');
			};

VB['chatInterativo'] = new Object();
VB['chatInterativo']['privado'] = true;
VB['chatInterativo']['replace']	= function(msg, k1, msgk1, k2, msgk2){
					if ( k1 != null && msgk1 != null )
						msg = msg.replace(k1, msgk1);
									
					if ( k2 != null && msgk2 != null )
						msg = msg.replace(k2, msgk2);
								
					return msg;
				};
				
VB['chatInterativo']['enviarMensagem'] 	= function(msg, data, array){
						if ( array != null && array.length < 2 )
							return;

						var users = VB.tools.getUserMentionAndSender(data, 1, array);
											
						if ( users.to == -1 )
							return;
											
						API.sendChat(VB.chatInterativo.replace(msg, '${to}', users.to, '${from}', data.un));
					};
								
VB['bm'] = new Object();
VB['bm']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.BOUNCER; };
VB['bm']['ativo'] 	= false;
VB['bm']['aviso']	= null;
VB['bm']['duracao'] 	= API.BAN.HOUR;
VB['bm']['funcAviso'] 	= function() {
				var txt1 = ":exclamation: BAN ON MEH ATIVADO - USUÁRIOS QUE VOTAREM CHATO SERÃO BANIDOS ";

				switch ( VB.bm.duracao ){
					case API.BAN.HOUR :
					txt1 += "POR 1 HORA";
					break;
							
				case API.BAN.DAY :
					txt1 += "POR 1 DIA";
					break;
						
				case API.BAN.PERMA :
					txt1 += "PERMANENTEMENTE";
					break;
				}
					
				API.sendChat(txt1);
			};
					
VB['bm']['executar'] 	= function(data, array){
				if (array.length > 1) {
					switch (array[1].toLowerCase()) {
						case "on":
							VB.bm.ativo = true;

							VB.bm.funcAviso();
							VB.bm.aviso = setInterval(VB.bm.funcAviso,60000);

							break;
									
						case "off":					
							VB.bm.ativo = false;
							API.sendChat(":exclamation: BAN ON MEH DESATIVADO");
							window.clearTimeout(VB.bm.aviso);
							break;
										
						case "1h":
							VB.bm.duracao = API.BAN.HOUR;
							API.sendChat("BAN ON MEH banirá por 1 hora quem votar chato");
							break;

						case "1d":
							VB.bm.duracao = API.BAN.DAY;
							API.sendChat("BAN ON MEH banirá por 1 dia quem votar chato");
							break;
										
						case "p":
							if ( API.getUser(data.uid).role == API.ROLE.BOUNCER ){
								API.sendChat("Solicitante não pode banir permanentemente. BAN ON MEH banirá por 1 dia quem votar chato");
								VB.bm.duracao = API.BAN.DAY;
							}
							else{
								VB.bm.duracao = API.BAN.PERMA;
								API.sendChat("BAN ON MEH banirá permanentemente quem votar chato");
							}
							break;
									
						case "now":
							API.sendChat("Banindo quem votou chato");
										
							var users = API.getUsers();
										
							for(var i in users){
								if ( users[i].vote == -1)
									API.moderateBanUser(id, 0, VB.bm.duracao);
							}
							break;
								
						default:
							API.sendChat("Parâmetro inválido");
					}
				} else {
					API.sendChat((VB.bm.ativo) ? ":exclamation: BAN ON MEH DESATIVADO" : VB.bm.funcAviso());
					VB.bm.ativo = (VB.bm.ativo) ? false : true;
					
					if (VB.bm.ativo)	
						VB.bm.aviso = setInterval(VB.bm.funcAviso, 60000);
					else
						window.clearTimeout(VB.bm.aviso);
				}
			};

VB['banmeh'] = VB['bm'];

VB['banonmeh'] = VB['bm'];
						
VB['flores'] = new Object();
VB['flores']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['flores']['mensagem'] 	= '@${to} você recebeu flores de ${from} :hibiscus: :tulip:';
VB['flores']['executar'] 	= function(data, array){ VB.chatInterativo.enviarMensagem(VB.flores.mensagem, data, array); };

VB['cerveja'] = new Object();
VB['cerveja']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['cerveja']['mensagem'] 	= '@${to} você recebeu de ${from} uma cerveja :beer::beers:';
VB['cerveja']['executar'] 	= function(data, array){ VB.chatInterativo.enviarMensagem(VB.cerveja.mensagem, data, array); };

VB['biscoito'] = new Object();
VB['biscoito']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['biscoito']['mensagem'] 	= '@${to} você recebeu de ${from} uma bolacha :cookie:';
VB['biscoito']['executar'] 	= function(data, array){ VB.chatInterativo.enviarMensagem(VB.biscoito.mensagem, data, array); };

VB['bolacha'] = new Object();
VB['bolacha']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['bolacha']['mensagem'] 	= '@${to} você recebeu de ${from} um bixcoito :cookie:';
VB['bolacha']['executar'] 	= function(data, array){ VB.chatInterativo.enviarMensagem(VB.bolacha.mensagem, data, array); };

VB['dedada'] = new Object();
VB['dedada']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['dedada']['mensagem'] 	= '@${to} você recebeu de ${from} uma dedada no reto :point_right::ok_hand:';
VB['dedada']['executar'] 	= function(data, array){ VB.chatInterativo.enviarMensagem(VB.dedada.mensagem, data, array); };

VB['suquinho'] = new Object();
VB['suquinho']['permissao'] = function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['suquinho']['mensagem'] 	= '@${to} você recebeu de ${from} um suquinho de laranja :tropical_drink:';
VB['suquinho']['executar'] 	= function(data, array){ VB.chatInterativo.enviarMensagem(VB.suquinho.mensagem, data, array); };

VB['oco'] = new Object();
VB['oco']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['oco']['mensagem'] 	= '@${to} o(a) ${from} vai deixar um oco em você! :o:';
VB['oco']['executar'] 	= function(data, array){ VB.chatInterativo.enviarMensagem(VB.oco.mensagem, data, array); };

VB['tesão'] = VB['oco'];

VB['tesao'] = VB['oco'];

VB['ping'] = new Object();
VB['ping']['permissao'] = function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['ping']['mensagem'] 	= '@${from} Pong!';
VB['ping']['executar'] 	= function(data, array){ VB.chatInterativo.enviarMensagem(VB.ping.mensagem, data, null); };

VB['autowoot'] = new Object();
VB['autowoot']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['autowoot']['mensagem'] 	= 'O Origem Woot é um javascript que oferece ferramentas para deixar seu plug.dj de cara nova com algumas funções para facilitar sua vida no plug, o Script Origem Woot foi Criado por Caipira, Mr. Assis e Sweet. http://origemwoot.weebly.com/';
VB['autowoot']['executar'] 	= function(data, array){ API.sendChat(VB.autowoot.mensagem); };

VB['emoji'] = new Object();
VB['emoji']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['emoji']['executar'] 	= function(data, array){ API.sendChat('Lista de emoticons: http://www.emoji-cheat-sheet.com/'); };

VB['comandos'] = new Object();
VB['comandos']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['comandos']['executar'] 	= function(data, array){ API.sendChat('Lista de comandos: http://www.mrpbrasil.com/Caipira/comandos.html'); };

VB['staff'] = new Object();
VB['staff']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['staff']['executar'] 	= function(data, array){ API.sendChat('Certos comandos só podem ser utilizados por membros da equipe de moderação.'); };

VB['regras'] = new Object();
VB['regras']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['regras']['executar'] 	= function(data, array){ API.sendChat('Regras da sala: http://www.mrpbrasil.com/Caipira/regras.html'); };

VB['chat'] = new Object();
VB['chat']['permissao'] = function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['chat']['executar'] 	= function(data, array){ API.sendChat('Chat para conversas privadas: http://webgo.mooo.com/virjschat'); };

VB['fb'] = new Object();
VB['fb']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['fb']['executar'] 	= function(data, array){ API.sendChat('Grupo da Balada dos Virjs no Facebook: https://www.facebook.com/groups/EliteDP/'); };

VB['pula'] = new Object();
VB['pula']['permissao'] = function(data){ return API.getUser(data.uid).role >= API.ROLE.BOUNCER || API.getUser(data.uid).id == API.getDJ().id; };
VB['pula']['manterMsg'] = true;
VB['pula']['executar'] 	= function(data, array){ API.sendChat(data.un + " pulou o vídeo"); API.moderateForceSkip(); };

VB['move'] = new Object();
VB['move']['permissao'] = function(data){ return API.getUser(data.uid).role >= API.ROLE.MANAGER; };
VB['move']['executar'] 	= function(data, array){		
				if (array.length >= 3) {
					var id = VB.tools.getIDUserByMention(2, array, data);
							
					if (id == -1)
						return;
									
					API.moderateMoveDJ(id, parseInt(array[1]));
				}else {
					API.sendChat("Não entendi o seu comando! Tente: !move posicao @nick");
				}
			};

VB['add'] = new Object();
VB['add']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.BOUNCER; };
VB['add']['executar'] 	= function(data, array){		
				var id = VB.tools.getIDUserByMention(1, array, data);
								
				if (id != -1)
					API.moderateAddDJ(id);
			};

VB['rem'] = new Object();
VB['rem']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.BOUNCER; };
VB['rem']['executar'] 	= function(data, array){		
				var id = VB.tools.getIDUserByMention(1, array, data);

				if (id != -1)
					API.moderateRemoveDJ(id);
			};
/*						
VB['detalhes'] = new Object();
VB['detalhes']['manterMsg'] 	= true;
VB['detalhes']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['detalhes']['executar'] 	= function(data, array){		
					var id = VB.tools.getIDUserByMention(1, array, data);
								
					if (id != -1){
						var usuario = API.getUser(id);
				
						var l1 = usuario.username + " possui " + usuario.ep;
						var l2 = " PP, " + usuario.xp + " pontos de XP "
						var l3 = "e nivel " + usuario.level
						API.sendChat( l1 + l2 + l3);
					}
				};
*/

VB['limite'] = new Object();
VB['limite']['permissao'] = function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['limite']['tempo'] 	= 390;
VB['limite']['excedido'] = function(obj){
				if( VB.limite.tempo > 0 && API.getMedia().duration > VB.limite.tempo) {
					API.sendChat("O vídeo excede o tempo limite definido de " + VB.tools.getTimeString(VB.limite.tempo));
					API.moderateForceSkip(0);
					API.moderateMoveDJ(obj.dj.id, 3);
									
					return true;
				}
				return false;
			};
			
VB['limite']['executar'] = function(data, array){
				if (array.length >= 2 && API.getUser(data.uid).role >= API.ROLE.BOUNCER){
					if ( VB.tools.maiorQueZero(array[1])) {
						VB.limite.tempo = array[1];
						API.sendChat("Tempo limite definido para " + VB.tools.getTimeString(array[1]));
						return;
					}

					if ( VB.tools.isOff(array[1]) ) {
						API.sendChat("Tempo limite desativado");
						VB.limite.tempo = -1;
						return;
					}

					if (isNaN(array[1]))
						API.sendChat("Comando inválido");
				} else {
					API.sendChat((VB.limite.tempo > 0) ? "Tempo limite definido: " + VB.tools.getTimeString(VB.limite.tempo) : "Tempo limite desativado");
				}
			};

VB['dc'] = new Object();
VB['dc']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['dc']['manterMsg'] = true;
VB['dc']['tempo'] 	= 1800;
VB['dc']['urlbase'] 	= 'http://www.mrpbrasil.com/LuizEduardo/';
VB['dc']['wlant']	= API.getWaitList();
VB['dc']['wlant'].unshift(API.getDJ());
VB['dc']['novo']	= function(id, pos){
				this.id = id;
				this.pos = pos;
			};
VB['dc']['exists']	= function(arr, id){
				for (var i in arr){
					if ( arr[i].id == id )
						return true;		
				}
				return false;
			};
VB['dc']['getDC'] 	= function(id){
				$.post(VB.dc.urlbase + 'getdc.php',{
					sala: VB.tools.idSala,
					userid: id
				}).done(function( resp ) {
					resp = JSON.parse(resp);
					if ( parseInt(resp.dcs[0].datadc) != -1 ){
										
						var user = API.getUser(id),
							posFila = parseInt(resp.dcs[0].pos);
	
						var tx1 = "@" + user.username + " você se desconectou a ";
						var tempo = parseInt(resp.dcs[0].datadc);
						var tx2 = VB.tools.getTimeString(tempo) + " atrás na ";
						var tx3 = (posFila == 0) ? ("cabine de DJ") : ("posição " + posFila + " da lista de espera");
	
						API.sendChat(tx1 + tx2 + tx3);
						var posAtual = API.getWaitListPosition(user.id);
	
						if ( tempo > VB.dc.tempo || API.getUser().role < API.ROLE.MANAGER ||  ( posAtual < posFila && posAtual != -1 ) )
							return;
						
						if ( posAtual == -1)
							VB.tools.addAndMoveDJ(user.id, (posFila == 0) ? 0 : posFila-1);
						else
							VB.tools.moveDJ(user.id, (posFila == 0) ? 0 : posFila-1, null);
					}
					else{
						API.sendChat("Não vi esse usuário se desconectar!");
					}
				}).fail(function() {
					API.sendChat("Falha ao consultar o servidor de dc!");
				});
			};
			
VB['dc']['newDC'] 	= function(obj){
				$.post( VB.dc.urlbase + 'newdc.php', {
					sala: 	VB.tools.idSala,
					userid: obj.id,
					pos: 	obj.pos
				} );
			};
			
VB['dc']['wlUpdate'] 	= function(obj){
				obj.unshift(API.getDJ());
	
				for(var i in VB.dc.wlant){
					if ( !VB.dc.exists(obj, VB.dc.wlant[i].id) ){
						if (API.getUser(VB.dc.wlant[i].id).id == null){
							VB.dc.newDC(new VB.dc.novo(VB.dc.wlant[i].id, i));			
							API.chatLog(VB.dc.wlant[i].username + ' se desconectou na posição ' + i, false);
						}
						else{
							API.chatLog(VB.dc.wlant[i].username + ' saiu da fila na posição ' + i, false);
						}
					}
				}
				
				VB.dc.wlant = obj;
				
				var vaux	= null,
					vet	= [];

				for(var i in obj){
					vaux = [2];
					vaux[0] = obj[i].id;
					vaux[1] = i;
						
					vet.push(vaux);
				}

/*				$.post( VB.dc.urlbase + 'wlupdate.php', {
					sala: VB.tools.idSala,
					lista: JSON.stringify(vet)
				} );
*/			};	
	
VB['dc']['executar'] 	= function(data, array){
/*				var id = VB.tools.getIDUserByMention(1, array, data);
								
				if (id != -1)
					VB.dc.getDC(id);									
*/			};

VB['sorteio'] = new Object();
VB['sorteio']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.COHOST; };
VB['sorteio']['pessoas'] 	= null
VB['sorteio']['thread'] 	= null;
VB['sorteio']['resultado'] 	= function(){
					if (VB.sorteio.pessoas.length <= 0) {
						API.sendChat("Ninguém se inscreveu no sorteio");
					}else{
						var sorteado = null;
						for (var x = 0; x < 5; x++)	sorteado = VB.sorteio.pessoas[Math.floor(Math.random()*VB.sorteio.pessoas.length)];
							
						API.sendChat("@" + API.getUser(sorteado).username + " ganhou o sorteio :v:");
						API.moderateMoveDJ(sorteado, 1);
					}

					VB.sorteio.pessoas 	= null;
					window.clearTimeout(VB.sorteio.thread);
					VB.sorteio.thread = null;
					VB.eu.manterMsg = false;
				};

VB['sorteio']['executar'] 	= function(data, array){
					if ( array.length > 1 ){
						if ( VB.sorteio.thread == null )
							return;
										
						if ( array[1].toLowerCase() == "off"){
							window.clearTimeout(VB.sorteio.thread);
							VB.sorteio.thread = null;
							VB.sorteio.pessoas = null;
							VB.eu.manterMsg = false;
										
							API.sendChat(":warning: Sorteio cancelado!");
							return;
						}
					}else{
						if (VB.sorteio.thread != null) {
							API.sendChat("O sorteio já está em execução!");
						} else {
							VB.sorteio.pessoas = new Array();
							VB.eu.manterMsg = false;
									
							API.sendChat(":warning: SORTEIO: O vencedor será movido para primeiro da fila (use !eu para participar)");
							VB.sorteio.thread = setTimeout(VB.sorteio.resultado, 60000);
						}
					}
				};
							
VB['eu'] = new Object();
VB['eu']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['eu']['manterMsg']	= true;
VB['eu']['inscrito']	= function(id){
				for (var x = 0; x < VB.sorteio.pessoas.length; x++) {
					if (VB.sorteio.pessoas[x] == id)
						return true;
				}
				return false;
			};
						
VB['eu']['executar'] 	= function(data, array){
				if ( VB.sorteio.thread == null ) 
					return;

				if ( API.getWaitListPosition(data.uid) == -1 ) {
					API.sendChat("@" + data.un + " você não está na fila de espera");
					return;
				}

				if ( !VB.eu.inscrito(data.uid) )
					VB.sorteio.pessoas.push(data.uid);
				else
					API.sendChat("@" + data.un + " você já está no sorteio!");
			};
				
VB['limpa'] = new Object();
VB['limpa']['permissao'] = function(data){ return API.getUser(data.uid).role >= API.ROLE.BOUNCER; };
VB['limpa']['tempo']	 = 3600;
VB['limpa']['thread']	 = null;
VB['limpa']['limpar']	 = function (todas){
				var messages = $('#chat-messages').children(),
					excluirmax = (todas == null ) ? messages.length - 10 : messages.length ;

				for (var i = 0; i < excluirmax; i++) {
				for (var j = 0; j < messages[i].classList.length; j++) {
					if (messages[i].getAttribute('data-cid') != null) {
						VB.tools.post('DELETE', 'chat/' + messages[i].getAttribute('data-cid'), null, null);
						break;
					}
				}
				}
			};

VB['limpa']['executar']	 = 	function(data, array){
					if (array.length >= 2) {

						if ( VB.tools.maiorQueZero(array[1]) ) {
							VB.limpa.tempo = parseInt(array[1]) * 60;
							API.sendChat("O chat será limpo automaticamente a cada " + VB.tools.getTimeString(VB.limpa.tempo));
								
							window.clearTimeout(VB.limpa.thread);
							VB.limpa.thread = setInterval(VB.limpa.limpar, VB.limpa.tempo*1000);
										
							return;
						}
						if ( VB.tools.isOff(array[1]) ){
							window.clearTimeout(VB.limpa.thread);
							VB.limpa.tempo = 0;
							API.sendChat("Limpeza automática de chat desativada");
							return;
						}
						if ( array[1].toLowerCase() == "tempo" ){
							API.sendChat("Limpeza automática de chat" + (VB.limpa.tempo > 0) ? " definida: " + VB.tools.getTimeString(VB.limpa.tempo) : " desativada");
							return;
						}
					}
					else{
						VB.limpa.limpar(true);
					}
				};
							
VB['musica'] = new Object();
VB['musica']['permissao'] 	= function(data){ return API.getUser(data.uid).role >= API.ROLE.BOUNCER; };
VB['musica']['ativo']		= false;
VB['musica']['detalhes'] 	= function(obj){
					if ( !VB.musica.ativo )
						return;
									
					var name 	= obj.lastPlay.dj.username + " tocou: ";
					var media 	= obj.lastPlay.media.author + " - " + obj.lastPlay.media.title + " [";
					var woot 	= obj.lastPlay.score.positive + " legais, ";
					var grab 	= obj.lastPlay.score.grabs + " adds e ";
					var meh 	= obj.lastPlay.score.negative + " chatos]";

					API.sendChat(name + media + woot + grab + meh);
				};
				
VB['musica']['executar']	= function(data, array){
					var str = "Status de música ";

					if (array.length > 1) {
						switch (array[1]) {
							case "on":
								VB.musica.ativo = true;
								str += "ativado!";
								break;
										
							case "off":
								VB.musica.ativo = false;
								str += "desativado!";
								break;

							default:
								API.sendChat("Parâmetro inválido");
						}
					} else {
						str += (VB.musica.ativo) ? "desativado!" : "ativado!";
						VB.musica.ativo = (VB.musica.ativo) ? false : true;
					}

					API.sendChat(str);
				};
							
VB['link'] = new Object();
VB['link']['permissao'] = function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['link']['executar']	= function(data, array){
				if(API.getMedia().format == 1) {
					API.sendChat("Vídeo atual: http://youtu.be/" + API.getMedia().cid);
				} else {
					var id = API.getMedia().cid;
					SC.get('/tracks', {ids: id,}, function(tracks) {
						API.sendChat("Música atual: " + tracks[0].permalink_url);
					});
				}
			};

VB['status'] = new Object();
VB['status']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['status']['executar']	= function(data, array){
					var str1 = "VirjsBot ativo a: " + VB.tools.getTimeString(parseInt(new Date(new Date().getTime() - VB.main.ativo.getTime()).getTime() / 1000));
					var str2 = "; tempo limite de vídeo: " + ((VB.limite.tempo >= 0 ) ? VB.tools.getTimeString(VB.limite.tempo) : "desativado");
					var str3 = "; tempo limite de dc: " + VB.tools.getTimeString(VB.dc.tempo);
					var str4 = '; tempo limite de AFK: ' + ((VB.afk.ativo) ? VB.tools.getTimeString(VB.afk.tempo) : 'desativado');
					API.sendChat(str1 + str2 + str3+ str4);			
				};
							
VB['ban'] = new Object();
VB['ban']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.BOUNCER; };			
VB['ban']['executar']	= function(data, array){
				if (array.length >= 3) {
					var id = VB.tools.getIDUserByMention(2, array);
									
					if (id == -1)
						return;

					switch (array[1].toLowerCase()) {
						case "1h":
							API.moderateBanUser(id, 4, API.BAN.HOUR);
							break;

						case "1d":
							API.moderateBanUser(id, 4, API.BAN.DAY);
							break;

						case "p":
							if ( API.getUser().role < API.ROLE.MANAGER ){
								API.sendChat("Hospedeiro do bot não pode banir permanentemente. O usuário será banido por 1 dia");
								API.moderateBanUser(id, 4, API.BAN.DAY);
								break;
							}
							if (API.getUser(data.uid).role < API.ROLE.MANAGER) {
								API.sendChat("O solicitante não poussui poderes para ban permanente. O usuário será banido por 1 dia");
								API.moderateBanUser(id, 4, API.BAN.DAY);
								break;
							}
							API.moderateBanUser(id, 4, API.BAN.PERMA);
							break;

						default :
							API.sendChat("Parâmetro inválido (1h, 1d, p)");
					}
				}
				else
					API.sendChat("Comando inválido");
			};
	
VB['unban'] = new Object();
VB['unban']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.MANAGER; };
VB['unban']['desbanir']		= function(msg, user){
					for (var i in msg.data){
						if ( msg.data[i].username == user){
							API.moderateUnbanUser(msg.data[i].id);
							API.sendChat(msg.data[i].username + " foi desbanido");
							return;
						}
					}					
					API.sendChat("Não encontrei " + user + " na lista de banidos!");
				};

VB['unban']['executar']		= function(data, array){
					if (array.length >= 2) {
						var user = VB.tools.getNickUserByMention(1, array);
								
						VB.tools.post('GET','bans', null, VB.unban.desbanir, user);									
					} else{
						API.sendChat("Parâmetro ausente (@username)!");
					}
				};

VB['dctempo'] = new Object();
VB['dctempo']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['dctempo']['executar']	= function(data, array){
					if (array.length > 1 && API.getUser(data.uid).role >= API.ROLE.MANAGER ) {
						if ( VB.tools.maiorQueZero(array[1]) ) {
							VB.dc.tempo = parseInt(array[1]) * 60;
							API.sendChat("Tempo limite de dc definido para " + VB.tools.getTimeString(VB.dc.tempo));
						}
						else{
							API.sendChat("Parâmetro inválido (segundos)");
						}									
					} else {
						API.sendChat("Tempo limite de dc definido: " + VB.tools.getTimeString(VB.dc.tempo));
					}
				};
							
VB['aw'] = new Object();
VB['aw']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.MANAGER; };
VB['aw']['ativo']	= true;
VB['aw']['woot']	= function(obj){
				if ( VB.aw.ativo )
					$("#woot").click();
			};
						
VB['aw']['executar']	= function(data, array){
				var str = "Autowoot ";

				if (array.length > 1) {
					switch (array[1].toLowerCase()) {
						case "on":
							VB.aw.ativo = true;
							str += "ativado!";
							break;
									
						case "off":
							VB.aw.ativo = false;
							str += "desativado!";
							break;

						default:
							str = "Parâmetro inválido";
					}
				} else {
					str += (VB.aw.ativo) ? "desativado!" : "ativado!";
					VB.aw.ativo = (VB.aw.ativo) ? false : true;
				}

				API.sendChat(str);
			};

VB['afk'] = new Object();
VB['afk']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.BOUNCER; };
VB['afk']['tempo']	= 15 * 60;
VB['afk']['ativo']	= false;
VB['afk']['wlm']	= new Object();
VB['afk']['userJoin']	= function(user){
				if ( VB.afk.wlm[user.id] == null ){
					VB.afk.wlm[user.id] = new Object();
					VB.afk.wlm[user.id]['data'] = new Date();
					VB.afk.setThreadInterval(user.id, 1, VB.afk.tempo);
				}
			};

VB['afk']['userLeave']	= function(user){
				if ( VB.afk.wlm[user.id] != null ){
					window.clearTimeout(VB.afk.wlm[user.id]['thread']);
					delete VB.afk.wlm[user.id];
				}
			};
						
VB['afk']['userVote']	= function(obj){
				VB.afk.setThreadInterval(obj.user.id, 1, API.getTimeRemaining() + VB.afk.tempo);
			};

VB['afk']['turnOn']	= function(){
				VB.afk.wlm = [];
				var obj = API.getUsers();
						
				for (var i in obj){
					if ( VB.afk.wlm[obj[i].id] == null ){
						VB.afk.wlm[obj[i].id] = new Object();
						VB.afk.setThreadInterval(obj[i].id, 1, VB.afk.tempo);
					}
				}	
			};
						
VB['afk']['turnOff']	= function(){
				var users = API.getUsers();
							
				for (var i in users){
					if ( typeof VB.afk.wlm[users[i].id] === 'undefined' )
						continue;
									
					window.clearTimeout(VB.afk.wlm[users[i].id]['thread']);
					delete VB.afk.wlm[users[i].id];
				}
			};

VB['afk']['setThreadInterval'] = function(id, numaviso, tempo){
					if ( !VB.afk.ativo )
						return;
										
					VB.afk.wlm[id]['aviso'] = numaviso;
							
					if ( VB.afk.wlm[id]['thread'] != null )
						window.clearTimeout(VB.afk.wlm[id]['thread']);
										
					VB.afk.wlm[id]['thread'] = setTimeout(function(){VB.afk.aviso(id, tempo, VB.afk.tempo );}, tempo * 1000);
				};

VB['afk']['aviso']	= function (id, tempo, tempodef){
				if ( !VB.afk.ativo )
					return;
					
				if ( ( API.getWaitListPosition(id) == -1 && API.getDJ().id != id ) || API.getUser(id).vote != 0 ){
					VB.afk.setThreadInterval(id, 1, VB.afk.tempo);
					return;
				}
				if ( id == API.getDJ().id ){
					VB.afk.setThreadInterval(id, VB.afk.wlm[id]['aviso'], API.getTimeRemaining() + 30);
					return;
				}
							
				switch ( VB.afk.wlm[id]['aviso'] ){
					case 1 :
						API.sendChat('@' + API.getUser(id).username + ' não vi você votar durante ' + VB.tools.getTimeString(tempodef) + '. Vote nos próximos dois minutos ou te removerei da lista de espera.');
						VB.afk.setThreadInterval(id, 2, 60);
						break;
								
					case 2 :
						API.sendChat('@' + API.getUser(id).username + ' este é o meu último aviso. Vote no próximo minuto ou te removerei da lista de espera.');
						VB.afk.setThreadInterval(id, 3, 60);
						break;
									
					case 3 :
						API.sendChat('@' + API.getUser(id).username + ' os avisos foram dados. Continue votando para não ser removido(a) da lista de espera.');
						VB.afk.setThreadInterval(id, 1, VB.afk.tempo);
								
						API.moderateRemoveDJ(id);
						break;
				}
			};
								
VB['afk']['executar']	= function(data, array){
				if (array.length >= 2) {
					if ( VB.tools.maiorQueZero(array[1]) ) {
						VB.afk.tempo = parseInt(array[1]) * 60;
						API.sendChat("Tempo limite de AFK na lista de espera: " + VB.tools.getTimeString(VB.afk.tempo));
						return;
					}
					if ( array[1].toLowerCase() == 'on' ){
						VB.afk.ativo = true;
						VB.afk.turnOn();
						API.sendChat("Remoção de AFK ativado, tempo limite: " + VB.tools.getTimeString(VB.afk.tempo));
						return;
					}
					if ( VB.tools.isOff(array[1]) ){
						VB.afk.ativo = false;
						VB.afk.turnOff();
						API.sendChat("Remoção de AFK desativado");
						return;
					}
					API.sendChat('Parâmetro inválido (minutos/on/off)');
				}
				else{
					API.sendChat( (VB.afk.ativo) ? 'Tempo limite de AFK na lista de espera: ' + VB.tools.getTimeString(VB.afk.tempo) : 'Remoção de AFK desativado' );
				}
			};

VB['tema'] = new Object();
VB['tema']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['tema']['tema'] 		= 'Livre';
VB['tema']['executar']	= function(data, array){
				if (array.length >= 2 && API.getUser(data.uid).role >= API.ROLE.MANAGER ) {
					VB.tema.tema = data.message.substring(array[0].length+1).trim();
					API.sendChat('Tema alterado para: ' + VB.tema.tema);
				}
				else{
					API.sendChat('Tema: ' + VB.tema.tema);
				}
			};

VB['welcome'] = new Object();
VB['welcome']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.MANAGER; };
VB['welcome']['ativo']		= false;
VB['welcome']['frase']		= 'Olá @${to}, bem-vindo(a) à nossa balada! Tema do momento: ${tema}';
VB['welcome']['exibirFrase'] 	= function(user){
					if ( VB.welcome.ativo )
					setTimeout(function(){API.sendChat(VB.chatInterativo.replace(VB.welcome.frase, '${to}', user.username, '${tema}', VB.tema.tema));}, 2000);
				};
				
VB['welcome']['executar']	= function(data, array){
					if (array.length >= 2) {
						if ( array[1].toLowerCase() == 'on' ){
							VB.welcome.ativo = true;
							API.sendChat('Mensagem de boas-vindas ativada');
							return;
						}
						if ( array[1].toLowerCase() == 'off' ){
							VB.welcome.ativo = false;
							API.sendChat('Mensagem de boas-vindas desativada');
							return;
						}
						VB.welcome.frase = data.message.substring(array[0].length+1).trim();
						API.sendChat('Mensagem de boas-vindas alterada');
					}
					else{
						API.sendChat('Parâmetro ausente (on/off/mensagem)');
					}
				};
						
VB['fim'] = new Object();
VB['fim']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.MANAGER; };		
VB['fim']['executar']	= function(data, array){
				if ( array.length == 1 || VB.tools.getNickUserByMention(1, array) == API.getUser().username )
					VB.main.off();
			};

VB['historico'] = new Object();
VB['historico']['itens'] = [];
VB['historico']['obterItens']	= function(){
					VB.tools.post('GET', 'rooms/history', null, function(msg){
						for (var i in msg.data){
							VB.historico.itens[i] = new Object();
							VB.historico.itens[i]['cid'] = msg.data[i].media.cid;
							VB.historico.itens[i]['data'] = (new Date(msg.data[i].timestamp)).getTime() - (3600 * 3 * 1000);
						}
					});
				};

VB['historico']['proximoDJ']	= function(obj){
					if ( typeof obj.media.cid === 'undefined' )
						return;
										
					if ( VB.historico.itens.length == 50 )
						VB.historico.itens.pop();
									
					var novo = new Object();
					novo['cid'] = obj.media.cid;
					novo['data'] = new Date().getTime();
					VB.historico.itens.unshift(novo);
									
					for (var i = 1; i < VB.historico.itens.length; i++){
						if ( VB.historico.itens[i].cid == obj.media.cid ){
							var agora = new Date().getTime(),
							data = agora - VB.historico.itens[i].data;
											
							API.sendChat( ((obj.media.format == 1) ? 'Vídeo' : 'Música' ) + ' no histórico (' + i + '/50), tocou a ' + VB.tools.getTimeString(parseInt(data/1000)) + ' atrás');
											
							if ( parseInt(data/1000) <= (3600 * 2) )
								API.moderateForceSkip(0);
												
								break;
						}
					}
				};
				
VB['eta'] = new Object();
VB['eta']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['eta']['executar']	= function(data, array){
				var hist = API.getHistory(),
					metade = parseInt(hist.length/2),
					ordenado = [],
					mediana = 0;

				for (var i in hist)
					ordenado.push(hist[i].media.duration);
					
				ordenado.sort(function(a,b){return a-b;});
				mediana = parseInt((ordenado[metade] + ordenado[metade+1])/2);

				if ( API.getDJ().id == data.uid ){
					API.sendChat('@' + data.un + ' você está na cabine de DJ!');
					return;
				}
							
				if ( API.getWaitListPosition(data.uid) == -1 ){
					API.sendChat('@' + data.un + ' você não está na fila!');
					return;
				}
					
				API.sendChat('@' + data.un + ': ' + VB.tools.getTimeString(API.getTimeRemaining() + API.getWaitListPosition(data.uid) * mediana));
			};

VB['stats'] = new Object();
VB['stats']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.NONE; };
VB['stats']['urlbase']		= 'http://www.mrpbrasil.com/LuizEduardo/stats/';
VB['stats']['userJoin']		= function(user){
/*					$.post(VB.stats.urlbase + 'user.php',{
						userid: user.id,
						username: VB.tools.aspas(encodeURI(user.username)),
						inicio: user.joined
					}).done(function( resp ) {
						$.post(VB.stats.urlbase + 'visitas.php',{
							url: VB.tools.idSala,
							userid: user.id
						});
					});
*/				
				};
VB['stats']['allUsers']		= function(user){
					var users = API.getUsers();
								
					for (var i in users)
						VB.stats.userJoin(users[i]);
				};
VB['stats']['room']		= function(){
/*					$.post(VB.stats.urlbase + 'sala.php',{
						url: VB.tools.idSala,
						nome: VB.tools.aspas(encodeURI(document.getElementsByClassName('bar-value')[0].innerText)),
						host: VB.tools.aspas(encodeURI(document.getElementsByClassName('username')[0].innerText))
					});
*/				};
VB['stats']['dj']		= function (obj){
/*					$.ajax({
						type: 'GET',
						url: 'https://plug.dj/_/rooms/history',
						contentType: 'application/json'}
					).done(function( msg ) {
						var obj = msg.data[0];
						
						$.post(VB.stats.urlbase + 'dj.php',{
							userid: obj.user.id,
							nick: VB.tools.aspas(encodeURI(obj.user.username)),
							url: VB.tools.idSala,
							nomesala: VB.tools.aspas(encodeURI(document.getElementsByClassName('bar-value')[0].innerText)),
							host: VB.tools.aspas(encodeURI(document.getElementsByClassName('username')[0].innerText)),
							yid: obj.media.cid,
							nome: VB.tools.aspas(encodeURI(obj.media.author + " - " + obj.media.title)),
							format: obj.media.format,
							duracao: obj.media.duration,
							woot: obj.score.positive,
							grab: obj.score.grabs,
							meh: obj.score.negative,
							pulou: obj.score.skipped,
							populacao: $('span.bar-count').text()
						});
					});
*/				};
							
VB['stats']['executar']	= function(data, array){
/*				var id = -1;
				if ( array.length > 1 ){
					id = VB.tools.getIDUserByMention(1, array);
					
					if ( id == -1)
						return;
				}
				else{
					id = data.uid;
				}
				
				$.post(VB.stats.urlbase + 'getStats.php',{
					userid: id,
					sala: VB.tools.idSala
				}).done(function( resp ) {
					resp = JSON.parse(resp),
						str = '@' + API.getUser(id).username;
					
					if ( resp.existe ){
						str += ' nesta sala você já tocou ' + resp.contador + ' vezes,';
						str += ' já levou ' + resp.woot + ' woots,';
						str += ' ' + resp.meh + ' mehs';
						str += ' e foi adicionado ' + resp.grab + ' vezes.';
					}else{
						str += ' não tenho registros sobre você!';
					}
					API.sendChat(str);
				});
*/			};
			
VB['bl'] = new Object();
VB['bl']['permissao']	= function(data){ return API.getUser(data.uid).role >= API.ROLE.MANAGER; };
VB['bl']['urlbase']		= 'http://www.mrpbrasil.com/LuizEduardo/stats/';
VB['bl']['add']			= function(id){
/*					var vid = API.getMedia(),
						dj = API.getDJ();
								
					$.post(VB.stats.urlbase + 'bl.php',{
						acao: 'insert',
						userid: id,
						nick: VB.tools.aspas(encodeURI(API.getUser(id).username)),
						url: VB.tools.idSala,
						nomesala: VB.tools.aspas(encodeURI(document.getElementsByClassName('bar-value')[0].innerText)),
						host: VB.tools.aspas(encodeURI(document.getElementsByClassName('username')[0].innerText)),
						yid: vid.cid,
						nome: VB.tools.aspas(encodeURI(vid.author + " - " + vid.title)),
						format: vid.format,
						duracao: vid.duration,
					});
*/				};

VB['bl']['rem']			= function(cid){
/*					$.post(VB.stats.urlbase + 'bl.php',{
						acao: 'remove',								
						url: VB.tools.idSala,
						yid: cid,								
					});
*/				};

VB['bl']['get']			= function(cid){
/*					$.post(VB.stats.urlbase + 'bl.php',{
						acao: 'get',								
						url: VB.tools.idSala,
						yid: cid,								
					}).done(function( resp ) {
						resp = JSON.parse(resp);
							
						if ( resp.existe ){
							API.sendChat('Item na blacklist!');
							API.moderateForceSkip();
						}
					});
*/				};
	
VB['bl']['executar']	= function(data, array){
/*				if (array.length > 1) {
					switch (array[1].toLowerCase()) {
						case 'add':
							VB.bl.add(data.uid);
							API.sendChat('Item adicionado na blacklist por ' + data.un);
							API.moderateForceSkip();										
							break;
										
						case 'rem':
							VB.bl.rem(API.getHistory()[1].media.cid);
							API.sendChat('Último item tocado foi removido da blacklist por ' + data.un);
							break;
						default:
							API.sendChat('Parâmetro inválido');
					}
				}
				else
					API.sendChat('Parâmetro ausente (add/rem)');
*/			};
			
VB['video'] = new Object();
VB['video']['privado'] 		= true;
VB['video']['checkVideo'] 	= function(obj){
					if ( obj.media.format == 1){
						$.ajax({
							url: 'https://gdata.youtube.com/feeds/api/videos/' + obj.media.cid,
							contentType: 'text/plain'}
						).fail(function(e){
							API.sendChat('Vídeo indisponível (' + e.responseText + ')!');
							API.moderateForceSkip();
						});
					}
				}

VB['eventos'] = new Object();
VB['eventos']['voto'] 	= function (data) {
				if (data.vote == -1 && VB.bm.ativo && API.getUser(data.user.id).role == API.ROLE.NONE ) {
					API.moderateBanUser(data.user.id, 0, VB.bm.duracao);
					return;
				}
				VB.afk.userVote(data);
			};

VB['eventos']['proximoDj'] 	= function(obj){
					VB.musica.detalhes(obj);
					VB.aw.woot(obj);
					
					if (VB.limite.excedido(obj))
						return;
					
					VB.stats.dj(obj);
					VB.historico.proximoDJ(obj);
					
					VB.bl.get(obj.media.cid);
					VB.video.checkVideo(obj);
				};

VB['eventos']['chat'] = function(data){
				if ( data.message.trim() == 'AutoWoot: http://adf.ly/qMlEA' ){
					VB.tools.post('DELETE', 'chat/'+data.cid, null);
					return;
				}

				if ( data.message.trim().charAt(0) != '!')
					return;
				
				if ( data.uid == null ){
					API.sendChat('Erro: não foi possível obter o ID do usuário. Consulte o log do navegador para obter detalhes do objeto passado por parâmetro.');
					console.log(obj);
					return;
				}
						
				var res = data.message.trim().split(" ");
					res[0] = res[0].substring(1).toLowerCase();
				
				if ( VB[res[0]] != null && typeof VB[res[0]].privado  === 'undefined' && VB[res[0]].permissao(data) ){
					VB[res[0]].executar(data, res);
								
					if ( !VB[res[0]].manterMsg )
					VB.tools.post('DELETE', 'chat/' + data.cid, null);
//					API.moderateDeleteChat(data.cid);
				}
			};

VB['eventos']['userJoin']  = function(user){
				VB.afk.userJoin(user);
				VB.welcome.exibirFrase(user);
				VB.stats.userJoin(user);
			};
						
VB['eventos']['userLeave'] 	= function(user){
					VB.afk.userLeave(user);
				};
			
VB['eventos']['wlUpdate'] 	= function(users){
					VB.dc.wlUpdate();
				};

VB['eventos']['command'] = function(comando){
				if ( comando.trim() == "/botoff" ) {
					if ( VB.main.ativo == null ){
						API.chatLog("O bot não está ativo", false);
						return;
					}
					VB.main.off();
				}
				if ( comando.trim() == "/boton" ) {
					if ( VB.main.ativo != null ){
						API.chatLog("O bot já está ativo", false);
						return;
					}
					VB.main.on();
				}
			};
							
VB['main'] = new Object();
VB['main']['ativo'] = null;
VB['main']['on'] 	= function(){
				API.on(API.ADVANCE, VB.eventos.proximoDj);
				API.on(API.WAIT_LIST_UPDATE, VB.dc.wlUpdate);
				API.on(API.VOTE_UPDATE, VB.eventos.voto);
				API.on(API.USER_JOIN, VB.eventos.userJoin);
				API.on(API.USER_LEAVE, VB.eventos.userLeave);
				API.on(API.CHAT, VB.eventos.chat);
						
				if ( VB.limpa.tempo > 0 )
					VB.limpa.thread = setInterval(VB.limpa.limpar, VB.limpa.tempo*1000);
					
				VB.main.ativo = new Date();
				VB.historico.obterItens();
				VB.stats.allUsers();
				API.sendChat("MrBotNEW ativado!");
			};

VB['main']['off'] 	= function(){
				API.off(API.ADVANCE, VB.eventos.proximoDj);
				API.off(API.WAIT_LIST_UPDATE, VB.dc.wlUpdate);
				API.off(API.VOTE_UPDATE, VB.eventos.voto);
				API.off(API.USER_JOIN, VB.eventos.userJoin);
				API.off(API.USER_LEAVE, VB.eventos.userLeave);
				API.off(API.CHAT, VB.eventos.chat);
							
				window.clearTimeout(VB.bm.aviso);
				window.clearTimeout(VB.limpa.thread);
				window.clearTimeout(VB.sorteio.thread);
				VB.sorteio.thread = null;
				VB.sorteio.pessoas = null;
				VB.afk.turnOff();
						
				VB.main.ativo = null;
				API.sendChat("VirjsBot desativado!");
			};

VB['main']['iniciarBot'] 	= function(){
					if(API.getUser().role > API.ROLE.BOUNCER){									
						VB.main.on();
						API.on(API.CHAT_COMMAND, VB.eventos.command);
					} else {
						API.chatLog("Você não possui poderes para ativar o MrBotNEW!", true);
					}
				};

VB.main.iniciarBot();

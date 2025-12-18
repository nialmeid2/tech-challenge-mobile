# Tech-challenge 3 - Mobile

Para rodar essa aplicação localmente, será necessário realizar algumas etapas:

1 - Instalar os pré-requisitos para debuggar a aplicação
2 - Configurar o firebase do back end

Lembrando que a aplicação só funcionará corretamente se tanto o aplicativo quanto o backend estiverem rodando simultaneamente



## Back end

Como todo aplicativo que se preze tem dados sendo persistidos, para que esse funcione corretamente, é necessário tanto configurar o firebase quanto fazer com que o backend consiga fazer a ponte dos dados entre a aplicação e o firebase.

### Criando projeto do firebase

1. Vá em https://firebase.google.com/ e clique em "ir para o console" (se você não estiver logado, faça o login e volte a essa mesma página)

2. Na tela seguinte, clique em "Criar novo projeto firebase"

3. Na próxima tela, dê um nome para o projeto (pode ser "bytebank mobile" por exemplo e clique em continuar

4. Clique em continuar na próxima tela (se quiser desabilitar o gemini, é com vc)

5. Na próxima tela, pode desabilitar o analytics e clicar em continuar (o app não usa analytics)

6. Na próxima tela, selecione a conta que vai usar (eu escolhi a padrão mesmo) e clique em continuar

7. Espere o Google criar seu projeto e te mandar para a tela inicial dele


Com esses passos feitos, teremos o projeto, mas não ainda o app para se conectar.


### Criando app para fazer a conexão


1. Clique em "Adicionar aplicativo" e depois escolha "web"

2. Na próxima tela, escolha um nickname pra ele (pode ser "backend bytebank", por exemplo) e depois clique em registrar app

3. Isso retornará uma tela com instruções. Não precisa instalar o firebase já que ele já tá instalado, mas os valores de comunicação retornados serão importantes. Eles se parecerão com isso (os dados exemplificados não são válidos mais pq excluí depois de escrever esse tutorial): 


```javascript

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOTzc-isWs7YRqTq9fU-11G3OB7tvYkRE",
  authDomain: "bb-modile.firebaseapp.com",
  projectId: "bb-modile",
  storageBucket: "bb-modile.firebasestorage.app",
  messagingSenderId: "1024663526196",
  appId: "1:1024663526196:web:6371ba89877fa8161ea361",
};

```

Como o projeto já tem um arquivo de configuração, eu omiti o resto do que é retornado. Copie esses dados e clique em "Seguir para o console"

4. Esses dados retornados se tornarão variáveis de ambiente. Para isso, crie o arquivo .env na pasta backend da raiz do projeto e crie os valores devidos lá:

```.env

API_KEY=AIzaSyDOTzc-isWs7YRqTq9fU-11G3OB7tvYkRE
AUTH_DOMAIN=bb-modile.firebaseapp.com
PROJECT_ID=bb-modile
STORAGE_BUCKET=bb-modile.firebasestorage.app
MESSAGING_SENDER_ID=1024663526196
APP_ID=1:1024663526196:web:6371ba89877fa8161ea361

```

Se na sua versão houver mais dados além desse, pode ignorar. O app não usa. Além disso, perceba que os valores são os mesmos retornados na criação do firebase. Além disso, os nomes das variáveis de ambiente NECESSARIAMENTE precisam ser esses

5. Vá em "Construir -> Autenticação" para criarmos o método de autenticação.

6. Na tela seguinte, clique em "Iniciar"

7. Clique em "Email/Password", que é o que o app usa. Nas opções que irão aparecer depois, habilite apenas "Email/Password" e clique em Salvar

8. Vá em "Construir -> Banco de dados Firestore"

9. Clique em "Criar Banco de Dados"

10. Selecione versão padrão e clique em "Próximo"

11. Para localização, selecione "Southamerica-east1 (São Paulo)" e clique em "Próximo"

12. Selecione "Iniciar em modo de teste" e clique em "Criar"

13. Clique em "Banco de dados Firestore" e depois vá na aba "Índices"

14. Clique em "Criar Índice" (como por padrão o firebase fica marcado em composto, não é necessário clicar nele)

15. Preencha "collection ID" com "transactions" e os campos indicando os índices vão ser preenchidos de acordo com essa imagem: ![Índices do Firebase](./indexes.png "Índices das transações").<br> 
Em outras palavras, os índices serão:

1. type "ascending", value "ascending", __name__ "ascending" (são dois _ antes e dois depois)
2. userId "ascending", createdAt "descending", __name__ "descending"
3. type "ascending", userId "ascending", value "ascending", __name__ "ascending"
4. type "ascending", userId "ascending", createdAt "descending", __name__ "descending"

16. Espere o status de todos os índices fica "habilitado" (na imagem está "enabled" pq uso o firebase em inglês)

17. Na pasta backend da raiz do projeto, abra um terminal e dê o comando `npm i` e depois o comando `npm run start:dev`

18. Em outro terminal dê o comando "ipconfig". Esse comando retornará vários endereços de ip, mas o que importa de verdade é um nesse formato:

```text

Ethernet adapter Ethernet 2:

   Connection-specific DNS Suffix  . : meuintelbras.local
   Link-local IPv6 Address . . . . . : xxxxxxxxxxxxxxxxxxxxxxxxxxx
   IPv4 Address. . . . . . . . . . . : 192.168.5.193
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : xxxxxxxxxxxxxxx

```

O ipv4 address que será usado para se conectar ao backend.

19. Para testar se a conexão está funcionando, vá até o browser e use o seguinte endereço: http://{enderecoIpv4Encontrado}:3000/user. Se estiver escolhido o ipv4 correto, a seguinte página será retornada ao acessar esse link: ![Conexão saudável](./healthy.png "A conexão está saudável")

20. Na pasta app da raiz do projeto, crie um .env e com a seguinte variável de ambiente:

```.env

BACKEND_URL=http://192.168.5.193:3000/

```

Aqui estou usando o ip de exemplo, mas ele pode se modificar. O importante é ser o mesmo ip do passo anterior




## Rodando o aplicativo

### Instalando e configurando pré requisitos

1. Baixe e instale o Android Studio;

2. Crie um projeto de Hello World funcional no Android Studio (ou ele não te deixa abrir o SDK Manager);

3. Vá em tools/SDK Manager e baixe o que for necessário lá (baixe o que vier marcado, tem bastante coisa para fazer o projeto funcionar)

4. Tente rodar o projeto Hello World. Fazer isso te obrigará a criar um emulador. Não esqueça de deixar o emulador rodando (ou, quando precisar disso no passo 6, abra o Android Studio e rode o emulador);

5. Para fazer com que o CLI do react-native reconheça tanto a SDK do Android qto a JDK, é necessário criar algumas entradas na variável de ambiente PATH:
	1. o diretório raiz do sdk e o platform-tools que veio instalado junto com o Android Studio (Lembre-se de colocar o que vem em C:\Users\[usuario]\AppData\Local\Android\Sdk, pois o diretório de instalação é somente leitura mesmo que você execute o cmd em modo de administrador; não esqueça que [usuario] é o username que vc escolheu qd instalou o windows). Em outras palavras, as seguintes entradas deverão estar no PATH:
		1. C:\Users\[usuario]\AppData\Local\Android\Sdk
		4. C:\Users\[usuario]\AppData\Local\Android\Sdk\platform-tools
	2. Não esqueça de verificar se a JDK (pelo menos 17) tbm está inclusa no Path. Pelo menos essas duas entradas devem estar lá pro Java ser reconhecido na CLI:
		1. C:\Program Files\Java\jdk-17 (na minha máquina está 23 ao invés de 17, mas o importante é a versão ser ao menos 17)
		2. C:\Program Files\Java\jdk-17\bin (a mesma observação da entrada anterior se aplica)

### Rodando app

1. Tenha total certeza de que antes o backend está rodando corretamente e de que vc tem uma variável de ambiente indicando qual é a url do backend

2. Na pasta do projeto, no subdiretório app, dê os comando `npm i`, depois `npm start`. O último rodará o metro bundler, fazendo com que o aplicativo esteja pronto para rodar em android

3. Em um terminal separado, use o comando `npm run android`. Se estiver configurado ou o seu aparelho celular ou o emulador do Android Studio corretamente, a aplicação começará a ser compilada para o app então ser instalado no dispositivo de destino
	1. Se o compilador chiar com não reconhecer o gradle (nas versões mais recentes do sdk do android isso não ocorre mais, mas não é impossível), será necessário baixar o gradle e referenciar no PATH
	2. Se o compilador chiar por causa de licenças do sdk, dê o comando sdkmanager --licenses e aceite todas as licenças que o prompt retornar
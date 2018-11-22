# NvmFramework

## NvmCache

[nvm-cache](https://github.com/sharkvik/nvm-framework/tree/master/projects/nvm-cache/src/lib)

Библиотека реализует кэширующий объект NvmCache, который предоставляет доступ к загруженному объекту и предоставлет возможность обновления по требованию.

Установка

```
npm install nvm-cache --save
```

Импорт

```
import { NvmCache } from 'nvm-cache';
```

### constructor(action: (id: string) => Observable<T>, ignoreCase: boolean = true)

В констркутор нужно передать метод получения/обновления данных по ключу.
Второй параметр опциональный. Задает регистрозависимость идентификаторов/ключей значений

```javascript
const nvmCache = new NvmCache<Type>((id: string) => this.http.get('http://localhost:4200/type/' + id));
```

### get(id: string): NvmSubject<T>

Метод возвращает объект NvmSubject<T>. Jбъект сродни ReplySubject<T> но расширен возможностью однократной подписки, и не отдает предыдущее значение в случае запуска процесса обновления данных.
В случае если значение было загружено в кэш ранее отдает значение, иначе запускает процесc получения данных, и после эмитит полученное значение
В случае обновления данных все подписчики получат новые значения.

```javascript
nvmCache.get(id).subscribe(newData => {
	// do something
});
```

### getOnce(id: string): Observable<T>

Метод возвращает обычный Observable<T> без постоянной подписки.
В случае если значение было загружено в кэш ранее отдает значение, иначе запускает процесc получения данных, и после эмитит полученное значение

```javascript
nvmCache.getOnce(id).subscribe(newData => {
	// do something
});
```

### refresh(id: string, data?: T): Observable<T>

Метод возвращает обычный Observable<T> без постоянной подписки.
Запускает процесс обновления кэша, и, затем, эмитит обновленное значение для всех подписчиков NvmSubject<T> с соответствующим id.
В случае если параметр data был заполнен, то обновляет кэш переданным значением, если пустой, то обновляет данные с помошью переданного в конструктор метода.

```javascript
nvmCache.refresh(id).subscribe();
```

### remove(id: string): void

Чистит кэш для переданного идентификатора.

```javascript
nvmCache.remove(id);
```

### clear(): void

Чистит весь кэш.

```javascript
nvmCache.clear();
```

### has(key: string): boolean

Возвращает true/false в зависимости есть ключ/идентификатор в кэкшк или нет.

```javascript
nvmCache.has(id);
```

### keys

Возвращает массив строк - все ключи, для которых есть закэшированные значения.

```javascript
nvmCache.keys;
```

## NvmStorage

[nvm-storage](https://github.com/sharkvik/nvm-framework/tree/master/projects/nvm-storage/src/lib)

## NvmLoader

[nvm-loader](https://github.com/sharkvik/nvm-framework/tree/master/projects/nvm-loader/src/lib)

## NvmQuagga

[nvm-quagga](https://github.com/sharkvik/nvm-framework/tree/master/projects/nvm-quagga/src/lib)

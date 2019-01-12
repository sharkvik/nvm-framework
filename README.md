# NvmFramework

## NvmCache

[nvm-cache](https://github.com/sharkvik/nvm-framework/tree/master/projects/nvm-cache/src/lib)

Библиотека реализует кэширующий объект NvmCache, который предоставляет доступ к загруженному объекту и предоставлет возможность обновления по требованию.

Установка

```
npm install nvm-cache --save
```

Импорт

```typescript
import { NvmCache } from 'nvm-cache';
```

### constructor(action: (id: string) => Observable<T>, ignoreCase: boolean = true)

В констркутор нужно передать метод получения/обновления данных по ключу.
Второй параметр опциональный. Задает регистрозависимость идентификаторов/ключей значений

```typescript
const nvmCache = new NvmCache<Type>((id: string) => this.http.get('http://localhost:4200/type/' + id));
```

### get(id: string): NvmSubject<T>

Метод возвращает объект NvmSubject<T>. Jбъект сродни ReplySubject<T> но расширен возможностью однократной подписки, и не отдает предыдущее значение в случае запуска процесса обновления данных.
В случае если значение было загружено в кэш ранее отдает значение, иначе запускает процесc получения данных, и после эмитит полученное значение
В случае обновления данных все подписчики получат новые значения.

```typescript
nvmCache.get(id).subscribe(newData => {
	// do something
});
```

### getOnce(id: string): Observable<T>

Метод возвращает обычный Observable<T> без постоянной подписки.
В случае если значение было загружено в кэш ранее отдает значение, иначе запускает процесc получения данных, и после эмитит полученное значение

```typescript
nvmCache.getOnce(id).subscribe(newData => {
	// do something
});
```

### refresh(id: string, data?: T): Observable<T>

Метод возвращает обычный Observable<T> без постоянной подписки.
Запускает процесс обновления кэша, и, затем, эмитит обновленное значение для всех подписчиков NvmSubject<T> с соответствующим id.
В случае если параметр data был заполнен, то обновляет кэш переданным значением, если пустой, то обновляет данные с помошью переданного в конструктор метода.

```typescript
nvmCache.refresh(id).subscribe();
```

### remove(id: string): void

Чистит кэш для переданного идентификатора.

```typescript
nvmCache.remove(id);
```

### clear(): void

Чистит весь кэш.

```typescript
nvmCache.clear();
```

### has(key: string): boolean

Возвращает true/false в зависимости есть ключ/идентификатор в кэкшк или нет.

```typescript
nvmCache.has(id);
```

### keys

Возвращает массив строк - все ключи, для которых есть закэшированные значения.

```typescript
nvmCache.keys;
```

## NvmStorage

[nvm-storage](https://github.com/sharkvik/nvm-framework/tree/master/projects/nvm-storage/src/lib)

Обертка над IndexDb Api, предоставляющая более стандартный интерфейс
Установка

```
npm install nvm-storage --save
```

Интеграция

```typescript
import { IDBWrapperService } from 'nvm-storage';

@Injectable({
	providedIn: 'root'
})
export class StorageService {
	private static readonly DB_NAME: string = 'sample-db';
	public isActive: boolean = false;

	constructor(private _db: IDBWrapperService) {
	}
}

```
### addMigration(migration: (db: IDBDatabase, ev: IDBRequest) => void): void
Регистрирует миграции базы, для поддержания актуальной версии.
Регистрация должна производиться до установления соединения.

```typescript
this._db.addMigration((db: IDBDatabase, ev: IDBRequest) => {
	db.createObjectStore('Entity', { autoIncrement: true });
});
this._db.addMigration((db: IDBDatabase, ev: IDBRequest) => {
	db.createObjectStore('Log', { autoIncrement: true });
});
```

### open(name): Subject<boolean>
Принимает в качестве параметра имя базы;
Открывает соединение с базой и высталяет флаг isActive в true если все прошло успешно.
Если версия базы ниже количества зарегистрированных миграций - обновляет базу.
Возвращает `Subject<boolean>` который эмитит значение true/false по завершении соединения.

```typescript
this._db.open(DB_NAME)
	.subscribe((result: booleean) => {
		this.isActive = true;
		console.log(result ? 'success' : 'fail');
	});
```

### insert(obj: IdItem): Observable<IdItem>
Реализует добавление элемента в базу.
Все сущности в базе должны реализовывать интерфейс IdItem.
Данные добавляются в существующую таблицу по имени класса.
В примере это будет таблица 'Entity'

```typescript
export class Entity implements IdItem {
	constructor(public id: number, public name: string)
}
const item = new Entity(1, 'Иванов Иван Иванович')
this._db.insert(item)
	.subscribe((result: IdItem) => {
		console.log(`объект добавлен успешно с id: ${result.id}`);
	});
```

### update(obj: IdItem, key: number): Observable<IdItem>
Реализует обновление элемента в базе

```typescript
item.name = 'Петров Петр Петрович';
this._db.update(item, 1)
	.subscribe((result: IdItem) => {
		console.log(`объект с id: ${result.id} обновлен: ${result.name}`);
	});
```

### select<T>(table: string, query?: IDBKeyRange): Observable<Array<T>>
Выборка из базы

```typescript
this._db.select<Entity>('Entity', IDBKeyRange.bound(1, 20))
	.subscribe((items: Entity[]) => {
		console.log(`Найдено элементов в базе с id от 1 до 20: ${items.length} штук`);
	});
```

### delete(table: string, key: string): Observable<boolean>
Реализует удаление из базы.

```typescript
this._db.delete('Entity', '1')
	.subscribe((result: boolean) => {
		console.log(`объект с id: ${result.id} удален ${!result ? 'не ' : '' }успешно`);
	});
```

## NvmLoader

[nvm-loader](https://github.com/sharkvik/nvm-framework/tree/master/projects/nvm-loader/src/lib)

Модуль осуществляет lazy загрузку модулей без стандартного рутера.

Установка

```
npm install nvm-loader --save
```

Использование:

[Пример](https://github.com/sharkvik/test-lib)

## NvmQuagga

[nvm-quagga](https://github.com/sharkvik/nvm-framework/tree/master/projects/nvm-quagga/src/lib)

# NvmSettings

[nvm-settings](https://github.com/sharkvik/nvm-framework/tree/master/projects/nvm-settings/src/lib)

Модуль доступа к настройкам хранящимя на сервере в *.json
Установка

```
npm install nvm-settings --save
```

Интеграция

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { NvmSettingsModule, NvmSettingsService } from 'nvm-settings';

export const settingsProvider = (config: NvmSettingsService) => () => {
	return config.load('/assets/settings.json');
};

export const useAppConfigProvider = { provide: APP_INITIALIZER, useFactory: settingsProvider, deps: [NvmSettingsService], multi: true };

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		NvmSettingsModule.forRoot(),
	],
	providers: [
		useAppConfigProvider
	],
	bootstrap: [AppComponent]
})
export class AppModule { }


import { Component } from '@angular/core';
import { NvmSettingsService } from 'nvm-settings';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	private _value: string;
	constructor(
		private _settings: NvmSettingsService
	) {
		this._value = this._settings.get<string>('key');
	}
}
```

### getAsync<T>(key: string): Observable<T | null>

Асинхронное получение значения свойства key

```typescript
this.getAsync<string>(key).subscribe((value: string) => this._value = value);
```

### get<T>(key: string): T | null

Cинхронное получение значения свойства key

```typescript
this._value = this._settings.get<string>('key');
```

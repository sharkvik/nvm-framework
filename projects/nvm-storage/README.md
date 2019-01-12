# NvmStorage

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

	constructor(private _db: IDBWrapperService) {}
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
this._db.open(DB_NAME).subscribe((result: booleean) => {
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
	constructor(public id: number, public name: string);
}
const item = new Entity(1, 'Иванов Иван Иванович');
this._db.insert(item).subscribe((result: IdItem) => {
	console.log(`объект добавлен успешно с id: ${result.id}`);
});
```

### update(obj: IdItem, key: number): Observable<IdItem>

Реализует обновление элемента в базе

```typescript
item.name = 'Петров Петр Петрович';
this._db.update(item, 1).subscribe((result: IdItem) => {
	console.log(`объект с id: ${result.id} обновлен: ${result.name}`);
});
```

### select<T>(table: string, query?: IDBKeyRange): Observable<Array<T>>

Выборка из базы

```typescript
this._db
	.select<Entity>('Entity', IDBKeyRange.bound(1, 20))
	.subscribe((items: Entity[]) => {
		console.log(
			`Найдено элементов в базе с id от 1 до 20: ${items.length} штук`
		);
	});
```

### delete(table: string, key: string): Observable<boolean>

Реализует удаление из базы.

```typescript
this._db.delete('Entity', '1').subscribe((result: boolean) => {
	console.log(
		`объект с id: ${result.id} удален ${!result ? 'не ' : ''}успешно`
	);
});
```

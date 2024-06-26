import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ItemEditComponent } from '../Dialogs/item-edit/item-edit.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-finances',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './finances.component.html',
  styleUrl: './finances.component.scss'
})
export class FinancesComponent implements OnInit {
  constructor(private httpClient: HttpClient,
    private dialog: MatDialog,
  ) { }
  containerWidth: number = 0;
  isAnimated: boolean = false;
  array = <any>[];
  special_inex = 0;
  section_array = <any>[];
  flag1 = false;
  ngOnInit(): void {
    const buttons = document.querySelectorAll('.item__container__button');
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => this.showChoosen(index));
    });
    this.httpClient.get<any>(environment.api + `entry/${7}`).subscribe(
      (response) => {
        this.section_array = response[0]["Секция"].split(',').map(Number);
      },
    )
  }

  showChoosen(i: number): void {
    this.special_inex = i;
    const elem = document.getElementById('finances__layout');
    if (elem) {
      elem.style.marginTop = '0px';
    }
    const elem2 = document.getElementById('container__input');
    if (elem) {
      elem.style.marginTop = '80px';
    }
    this.httpClient.get<any[]>(environment.api + `entry/${i}`).subscribe(
      (response) => {
        this.array = response;
      },
      (error) => {
        console.error('Error:', error);
      }
    );
    const h3 = document.querySelectorAll('.item h3');
    const colors = ['black', 'black', 'black'];
    if (i >= 0 && i <= 2) {
      colors[0] = '#1ea01e';
    } else if (i >= 3 && i <= 5) {
      colors[1] = '#1ea01e';
    } else {
      colors[2] = '#1ea01e';
    }
    h3.forEach((heading, index) => {
      (heading as HTMLHeadingElement).style.color = colors[index];
    });
  }
  showChoosenDate(i: number): void {
    this.special_inex = i;
    const elem = document.getElementById('finances__layout');
    if (elem) {
      elem.style.marginTop = '80px';
    }
    const param1 = '2000-01-01';
    const param2 = '2025-01-01';
    this.httpClient.get<any[]>(`${environment.api}showdate/${i}?param1=${param1}&param2=${param2}`).subscribe(
      (response) => {
        this.array = response;
      },
      (error) => {
        console.error('Error:', error);
      }
    );

    const h3 = document.querySelectorAll('.item h3');
    const colors = ['black', 'black', 'black'];
    if ((i >= 0 && i <= 2) || i == 13) {
      colors[0] = '#1ea01e';
    } else if (i >= 3 && i <= 5) {
      colors[1] = '#1ea01e';
    } else {
      colors[2] = '#1ea01e';
    }
    h3.forEach((heading, index) => {
      (heading as HTMLHeadingElement).style.color = colors[index];
    });
  }

  searchData(): void {
    const param1 = document.getElementById('dateInputX') as HTMLInputElement;
    const param2 = document.getElementById('dateInputY') as HTMLInputElement;
    if (param1 && param2) {
      this.httpClient.get<any[]>(`${environment.api}showdate/${0}?param1=${param1.value}&param2=${param2.value}`).subscribe(
        (response) => {
          if (response.length < 1) {
            response.push(
              {
                "Дата": "999",
                "Сумма": "Не найдено",
                "Описание_Затраты": "Не найдено",
                "Секция_Идентификатор": 'Не найдено'
              }
            );
          }
          this.array = response;
        },
        (error) => {
          console.error('Error:', error);
        }
      );
    }
  }

  edit_item(item: any): void {
    if (this.flag1) {
      this.flag1 = false;
    }
    else {
      const dialogRef = this.dialog.open(ItemEditComponent, { data: { item: item, indexes: this.section_array } });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.edit_item_interface(result).subscribe({
            next: () => {
              this.showChoosen(this.special_inex);
            },
            error: (_: any) => {
              alert(_);
            }
          });
        }
      });
    }

  }
  formatDate(rawDate: string): string {
    if (rawDate == '999') return 'Не найдено';
    const date = new Date(rawDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  edit_item_interface(item: any): any {
    let dummy = {
      info: item.info,
      price: item.price,
      time: item.time,
      section: item.section,
      animal: item.animal,
    }
    return this.httpClient.put<any>(environment.api + `entry/${item.id}`, JSON.stringify(dummy), { headers: { 'Content-Type': 'application/json' } })
  }
  addCost(): void {
    let item = {
      "Идентификатор": 9999,
      "Дата": "2000-01-01T21:00:00.000Z",
      "Сумма": "",
      "Описание": "",
      "Секция_Идентификатор": 1
    }
    const dialogRef = this.dialog.open(ItemEditComponent, { data: { item: item, indexes: this.section_array } });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.add_item_interface(result).subscribe({
          next: () => {
            this.showChoosen(this.special_inex);
          },
          error: (_: any) => {
            alert(_);
          }
        });
      }
    });
  }
  add_item_interface(item: any): any {
    return this.httpClient.post<any>(environment.api + `entry`, JSON.stringify(item), { headers: { 'Content-Type': 'application/json' } })
  }
  alertIndexes(): void {
    alert(`У нас доступны СЕКЦИИ: ${this.section_array}`);
  }
  addGain(): void {
    let item = {
      "Идентификатор": 8888,
      "Дата": "2030-02-02T21:00:00.000Z",
      "Сумма": "",
      "Описание": "",
      "Животное_Идентификатор": 1
    }
    const dialogRef = this.dialog.open(ItemEditComponent, { data: { item: item, indexes: this.section_array } });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.add_item_interface(result).subscribe({
          next: () => {
            this.showChoosen(this.special_inex);
          },
          error: (_: any) => {
            alert(_);
          }
        });
      }
    });
  }
  deleteitem(item: any): void {
    this.flag1 = true;
    let str = ``;
    if (item["Секция_Идентификатор"]) {
      str = `Вы точно хотите удалить запись? \n ${item["Описание"]} \n Сумма: ${item["Сумма"]} \n Секция: ${item["Секция_Идентификатор"]}`
    }
    else {
      str = `Вы точно хотите удалить запись? \n ${item["Описание"]} \n Сумма: ${item["Сумма"]} \n Животное: ${item["Животное_Идентификатор"]}`
    }
    const verife = confirm(str);
    if (verife) {
      this.delete_help(item).subscribe({
        next: () => {
          this.showChoosen(this.special_inex);
        },
        error: (_: any) => {
          alert(_);
        }
      });
    }
  }
  delete_help(item: any): Observable<any> {
    return this.httpClient.delete(environment.api + `entry/${item["Идентификатор"]}`, { body: item })
  }
  saveData(): void {
    let number = 2;
    this.post_report(this.array, number).subscribe({
      next: () => {
        const download = (path: string, filename: string) => {
          const link = document.createElement('a');
          link.href = path;
          link.download = filename;

          link.dispatchEvent(new MouseEvent('click'));
        };
        download('/assets/Zatrati.xlsx', 'Zatrati.xlsx');
      },
      error: (_: any) => {
        alert(_);
      }
    });
  }
  post_report(item: any, number: number): any {
    console.log('post report called for Затраты');
    return this.httpClient.post<any>(environment.api + `report/${number}`, JSON.stringify(item), { headers: { 'Content-Type': 'application/json' } })
  }
  saveRevenue(): void {
    let number = this.special_inex;
    this.post_report(this.array, number).subscribe({
      next: () => {
        const download = (path: string, filename: string) => {
          const link = document.createElement('a');
          link.href = path;
          link.download = filename;

          link.dispatchEvent(new MouseEvent('click'));
        };
        download('/assets/Revenue.xlsx', 'Revenue.xlsx');
      },
      error: (_: any) => {
        alert(_);
      }
    });
  }
}

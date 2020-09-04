import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

const a = '123';
const b = `456 ${a}`;

@Component({
  selector: 'neo-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit {
  a = '123';
  b = `456`;

  listOfMenuItem = [
    {
      icon: 'project',
      text: $localize`:@@admin.platform:Platform`,
      children: [
        {
          href: ['namespaces'],
          disabled: false,
          icon: 'appstore',
          text: $localize`:@@admin.namespaces:Namespaces`
        }
      ]
    }
  ];

  constructor() {}
  ngOnInit(): void {
    this.modalService.create({
      nzTitle: 'title'
    });

    this.nzMessage.success(`Success`);_
    this.nzMessage.success(123);
    this.nzMessage.success(name);
    this.nzMessage.success('abc');_

    a.subscribe(() => {
      this.nzMessage.success(`Success`);_
      this.nzMessage.success(123);
      this.nzMessage.success(name);
      this.nzMessage.success('abc');_
    })
  }
}

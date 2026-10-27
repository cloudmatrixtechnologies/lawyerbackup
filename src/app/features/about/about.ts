import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  credentials = [
    { title: 'Three Qualified Advocates', sub: 'B.A., LL.B. · B.A., LL.M.',          icon: 'school'   },
    { title: 'Civil · Criminal · Family',  sub: 'Property & Documentation',          icon: 'shield'   },
    { title: 'Ammapet, Salem',             sub: '6/1C, Arunachalam Street',          icon: 'location' },
    { title: 'Free Legal Advice Centre',   sub: 'இலவச சட்ட ஆலோசனை மையம்',            icon: 'clock'    },
  ];
}

(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- build the nest of nails ---- */
  var g = document.getElementById('nails');
  var svgEl = document.getElementById('nest');
  var NS = 'http://www.w3.org/2000/svg';

  if (g && svgEl) {
  var seed = 20260822;
  function rnd(){ seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }

  var cx = 260, cy = 152, rx = 148, ry = 52;
  var spots = [];

  function tangent(t){ return Math.atan2(ry * Math.cos(t), -rx * Math.sin(t)) * 180 / Math.PI; }

  // back rim — the upper arc, laid down first so the bowl reads as deep
  for (var a = 0; a < 17; a++){
    var t = Math.PI + (a / 16) * Math.PI + (rnd() - 0.5) * 0.16;
    var b = 0.93 + rnd() * 0.12;
    spots.push({
      x: cx + Math.cos(t) * rx * b,
      y: cy + Math.sin(t) * ry * b - rnd() * 9,
      len: 62 + rnd() * 34,
      rot: tangent(t) + (rnd() - 0.5) * 46
    });
  }

  // the weave — short, crossing pieces packed into the bowl
  for (var c = 0; c < 26; c++){
    var t2 = 0.1 * Math.PI + rnd() * 0.8 * Math.PI;
    var b2 = 0.24 + rnd() * 0.74;
    spots.push({
      x: cx + Math.cos(t2) * rx * b2 * (0.55 + rnd() * 0.7) - 34,
      y: cy + Math.sin(t2) * ry * b2 * 1.12 + (rnd() - 0.3) * 16,
      len: 70 + rnd() * 42,
      rot: (rnd() - 0.5) * 74
    });
  }

  // front rim — placed last so these sit over the weave
  for (var d = 0; d < 15; d++){
    var t3 = (d / 14) * Math.PI + (rnd() - 0.5) * 0.18;
    var b3 = 0.9 + rnd() * 0.16;
    spots.push({
      x: cx + Math.cos(t3) * rx * b3,
      y: cy + Math.sin(t3) * ry * b3 + rnd() * 7,
      len: 66 + rnd() * 40,
      rot: tangent(t3) + (rnd() - 0.5) * 52
    });
  }

  for (var i = 0; i < spots.length; i++){
    var s = spots[i];
    var half = s.len / 2;
    var px = s.x - Math.cos(s.rot * Math.PI / 180) * half;
    var py = s.y - Math.sin(s.rot * Math.PI / 180) * half;

    var nail = document.createElementNS(NS, 'g');
    nail.setAttribute('class', 'nail');
    nail.style.setProperty('--x', px.toFixed(1) + 'px');
    nail.style.setProperty('--y', py.toFixed(1) + 'px');
    nail.style.setProperty('--r', s.rot.toFixed(1) + 'deg');
    nail.style.setProperty('--x0', (px + (rnd() - 0.5) * 130).toFixed(1) + 'px');
    nail.style.setProperty('--y0', (py - 170 - rnd() * 120).toFixed(1) + 'px');
    nail.style.setProperty('--r0', (s.rot + (rnd() - 0.5) * 240).toFixed(1) + 'deg');
    nail.style.setProperty('--d', (i * 22) + 'ms');

    var shaft = document.createElementNS(NS, 'rect');
    shaft.setAttribute('x', 0); shaft.setAttribute('y', -2.6);
    shaft.setAttribute('width', s.len); shaft.setAttribute('height', 5.2);
    shaft.setAttribute('rx', 2); shaft.setAttribute('fill', 'url(#shaft)');
    shaft.setAttribute('stroke', '#1c1a17'); shaft.setAttribute('stroke-width', '.5');

    var tip = document.createElementNS(NS, 'path');
    tip.setAttribute('d', 'M' + s.len + ' -2.6 L' + (s.len + 11) + ' 0 L' + s.len + ' 2.6 Z');
    tip.setAttribute('fill', '#3a3630');

    var head = document.createElementNS(NS, 'ellipse');
    head.setAttribute('cx', 0.6); head.setAttribute('cy', 0);
    head.setAttribute('rx', 3.6); head.setAttribute('ry', 6.4);
    head.setAttribute('fill', 'url(#head)');
    head.setAttribute('stroke', '#1c1a17'); head.setAttribute('stroke-width', '.5');

    nail.appendChild(shaft); nail.appendChild(tip); nail.appendChild(head);
    g.appendChild(nail);
  }

  var cap = document.getElementById('partcount');
  if (cap) cap.textContent = spots.length;

  /* ---- nest replay ---- */
  var replayBtn = document.getElementById('nestReplay');
  if (replayBtn) {
    replayBtn.addEventListener('click', function () {
      svgEl.classList.remove('built');
      void svgEl.offsetHeight; // force reflow so the removal takes effect before re-adding
      svgEl.classList.add('built');
    });
  }
  } // end nest-building guard

  /* ---- reveal on scroll ---- */
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) return;
        if (e.target === svgEl) e.target.classList.add('built');
        else e.target.classList.add('seen');
        io.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    if (svgEl) io.observe(svgEl);
    document.querySelectorAll('.rv').forEach(function(el, i){
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    if (svgEl) svgEl.classList.add('built');
    document.querySelectorAll('.rv').forEach(function(el){ el.classList.add('seen'); });
  }
  if (reduce && svgEl) svgEl.classList.add('built');

  /* ---- dynamic content: site text (hero, services, process, faq, contact) ---- */
  (function () {
    // Only bother fetching if this page actually has at least one
    // editable element — no point on pages with nothing to patch.
    var anchors = ['heroEyebrow','svcKicker1','stepTitle1','faqList','contactEmail'];
    var hasTarget = anchors.some(function (id) { return document.getElementById(id); });
    if (!hasTarget) return;

    fetch('/api/content/site').then(function (r) { return r.json(); }).then(function (d) {
      var site = d && d.site;
      if (!site) return;

      function setText(id, val) {
        var el = document.getElementById(id);
        if (el && val) el.textContent = val;
      }

      // ---- hero ----
      if (site.hero) {
        setText('heroEyebrow', site.hero.eyebrow);
        setText('heroLine1', site.hero.headline1);
        setText('heroLine2', site.hero.headline2);
        setText('heroLede', site.hero.lede);
        setText('heroNote', site.hero.note);
      }

      // ---- services (3 fixed cards) ----
      if (Array.isArray(site.services)) {
        site.services.forEach(function (svc, i) {
          var n = i + 1;
          setText('svcKicker' + n, svc.kicker);
          setText('svcTitle' + n, svc.title);
          setText('svcDesc' + n, svc.description);
          var list = document.getElementById('svcFeat' + n);
          if (list && Array.isArray(svc.features) && svc.features.length) {
            list.innerHTML = svc.features.map(function (f) { return '<li>' + f + '</li>'; }).join('');
          }
        });
      }

      // ---- process (4 fixed steps) ----
      if (Array.isArray(site.process)) {
        site.process.forEach(function (step, i) {
          var n = i + 1;
          setText('stepTitle' + n, step.title);
          setText('stepDesc' + n, step.description);
          setText('stepWhen' + n, step.when);
        });
      }

      // ---- faq (grows/shrinks) ----
      var faqList = document.getElementById('faqList');
      if (faqList && Array.isArray(site.faq) && site.faq.length) {
        faqList.innerHTML = site.faq.map(function (item, i) {
          return '<details' + (i === 0 ? ' open' : '') + '><summary>' + item.question + '</summary><p>' + item.answer + '</p></details>';
        }).join('');
      }

      // ---- contact info ----
      if (site.contact) {
        var email = document.getElementById('contactEmail');
        if (email && site.contact.email) { email.textContent = site.contact.email; email.href = 'mailto:' + site.contact.email; }
        setText('contactWhatsapp', site.contact.whatsapp);
        setText('contactHours', site.contact.hours);
        setText('contactTakingOn', site.contact.takingOn);
      }
    }).catch(function () { /* static fallback content stays as-is */ });
  })();

  /* ---- dynamic content: work samples ---- */
  (function () {
    var zone = document.getElementById('workDynamicZone');
    if (!zone) return;
    fetch('/api/content/work').then(function (r) { return r.json(); }).then(function (d) {
      var items = d && d.items;
      if (!Array.isArray(items) || !items.length) return; // keep the static fallback card
      zone.innerHTML = items.map(function (item) {
        var badge = item.badge
          ? '<span class="demo-badge" style="bottom:10px;left:10px;position:absolute;z-index:4">' + item.badge + '</span>'
          : '';
        var link = item.url
          ? '<a class="proj-link" href="' + item.url + '" target="_blank" rel="noopener"><span>Open ' + item.title + '</span></a>'
          : '';
        var titleHtml = item.url
          ? '<a href="' + item.url + '" target="_blank" rel="noopener">' + item.title + '</a>'
          : item.title;
        var mockHtml = item.image
          ? '<div class="mock"><img src="' + item.image + '" alt="' + item.title + ' homepage" loading="lazy"></div>'
          : '<div class="mock">' +
              '<div class="hero-blk" style="background:' + item.gradient + '"></div>' +
              '<div class="band w88"></div>' +
              '<div class="row"><span></span><span></span></div>' +
              '<div class="band w45"></div>' +
            '</div>';
        return (
          '<article class="proj rv seen">' +
            '<div class="screen">' + badge + link +
              '<div class="bar"><i></i><i></i><i></i></div>' +
              mockHtml +
            '</div>' +
            '<div class="proj-body">' +
              '<span class="type">' + item.type + '</span>' +
              '<h3>' + titleHtml + '</h3>' +
              '<p>' + item.description + '</p>' +
              (item.result ? '<p class="result">' + item.result + '</p>' : '') +
            '</div>' +
          '</article>'
        );
      }).join('');
    }).catch(function () { /* static fallback card stays as-is */ });
  })();

  /* ---- dynamic content: pricing ---- */
  (function () {
    var grid = document.getElementById('priceGrid');
    if (!grid) return;
    fetch('/api/content/pricing').then(function (r) { return r.json(); }).then(function (d) {
      var items = d && d.items;
      if (!Array.isArray(items) || !items.length) return; // keep the static fallback tiers
      grid.innerHTML = items.map(function (tier) {
        var featured = !!tier.featured;
        var ctaAttrs = featured ? 'href="#contact" data-schedule' : 'href="#contact"';
        var ctaClass = featured ? 'btn btn-primary' : 'btn btn-ghost';
        var unit = tier.unit ? '<small> ' + tier.unit + '</small>' : '';
        var features = (tier.features || []).map(function (f) { return '<li>' + f + '</li>'; }).join('');
        return (
          '<div class="tier' + (featured ? ' feature' : '') + ' rv seen">' +
            '<h3>' + tier.name + '</h3>' +
            '<p class="sub">' + tier.subtitle + '</p>' +
            '<p class="amount">$' + tier.amount + unit + '</p>' +
            '<ul class="tick-list">' + features + '</ul>' +
            '<a class="' + ctaClass + '" ' + ctaAttrs + '>' + tier.ctaLabel + '</a>' +
          '</div>'
        );
      }).join('');
    }).catch(function () { /* static fallback tiers stay as-is */ });
  })();

  /* ---- scheduler ---- */
  (function () {
    var overlay = document.getElementById('schedOverlay');
    var stepPick = document.getElementById('schedStepPick');
    var stepDetails = document.getElementById('schedStepDetails');
    var stepDone = document.getElementById('schedStepDone');
    var grid = document.getElementById('schedGrid');
    var weekLabel = document.getElementById('schedWeekLabel');
    var prevBtn = document.getElementById('schedPrev');
    var nextBtn = document.getElementById('schedNext');
    var pickedNote2 = document.getElementById('schedPickedNote2');
    var backBtn = document.getElementById('schedBack');
    var closeBtn = document.getElementById('schedClose');
    var form = document.getElementById('schedForm');
    var doneSummary = document.getElementById('schedDoneSummary');
    var doneClose = document.getElementById('schedDoneClose');

    var TIMES = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                 '1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];
    var DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    var today = new Date(); today.setHours(0,0,0,0);
    var thisMonday = mondayOf(today);
    var weekStart = new Date(thisMonday);
    var picked = null;

    // Admin-set blocks (specific slots taken off the board, or whole dates
    // closed) layered on top of the simulated pattern below. Loaded once;
    // if the endpoint isn't configured yet, these just stay empty and the
    // scheduler behaves exactly as it did before.
    var adminBlockedSlots = {};
    var adminClosedDates = {};
    fetch('/api/schedule/availability').then(function (r) { return r.json(); }).then(function (d) {
      (d.blockedSlots || []).forEach(function (k) { adminBlockedSlots[k] = true; });
      (d.closedDates || []).forEach(function (k) { adminClosedDates[k] = true; });
      renderGrid();
    }).catch(function () { /* stays empty — pattern below still works */ });

    function mondayOf(d){
      var day = d.getDay();
      var diff = (day === 0 ? -6 : 1 - day);
      var m = new Date(d); m.setDate(d.getDate() + diff); m.setHours(0,0,0,0);
      return m;
    }
    function fmtDate(d){ return MON[d.getMonth()] + ' ' + d.getDate(); }

    function isTaken(dateKey, slotIdx){
      if (adminClosedDates[dateKey]) return true;
      if (adminBlockedSlots[dateKey + '|' + TIMES[slotIdx]]) return true;
      var str = dateKey + ':' + slotIdx, h = 0;
      for (var i = 0; i < str.length; i++){ h = (h * 31 + str.charCodeAt(i)) >>> 0; }
      return (h % 5) === 0;
    }
    function isPast(dayDate, timeStr){
      if (dayDate.getTime() > today.getTime()) return false;
      if (dayDate.getTime() < today.getTime()) return true;
      var now = new Date();
      var m = timeStr.match(/(\d+):(\d+) (AM|PM)/);
      var h = parseInt(m[1],10) % 12 + (m[3] === 'PM' ? 12 : 0);
      var probe = new Date(); probe.setHours(h, parseInt(m[2],10), 0, 0);
      return probe.getTime() <= now.getTime();
    }

    function renderGrid(){
      var days = [];
      for (var i = 0; i < 5; i++){
        var d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
        days.push(d);
      }
      var weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 4);
      weekLabel.textContent = fmtDate(weekStart) + ' \u2013 ' + fmtDate(weekEnd) + ', ' + weekEnd.getFullYear();
      prevBtn.disabled = weekStart.getTime() <= thisMonday.getTime();

      grid.innerHTML = '';
      var anyOpen = false;

      days.forEach(function (d) {
        var key = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
        var col = document.createElement('div');
        col.className = 'sched-day';
        var head = document.createElement('div');
        head.className = 'dname';
        head.innerHTML = DOW[d.getDay()] + '<small>' + fmtDate(d) + '</small>';
        col.appendChild(head);

        var openCount = 0;
        TIMES.forEach(function (t, idx) {
          var taken = isTaken(key, idx) || isPast(d, t);
          if (!taken) { openCount++; anyOpen = true; }
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'slot' + (taken ? ' taken' : '');
          btn.textContent = t;
          btn.disabled = taken;
          if (!taken) {
            btn.addEventListener('click', function () {
              picked = { key: key, date: d, time: t, label: DOW[d.getDay()] + ', ' + fmtDate(d) };
              goToDetails();
            });
          }
          col.appendChild(btn);
        });

        if (openCount === 0) {
          var full = document.createElement('div');
          full.style.cssText = 'text-align:center;font-size:.74rem;color:var(--gun-mid);padding-top:.3rem;';
          full.textContent = 'Fully booked';
          col.appendChild(full);
        }
        grid.appendChild(col);
      });

      if (!anyOpen) {
        var msg = document.createElement('div');
        msg.className = 'sched-empty';
        msg.textContent = 'Nothing open this week — try the next one.';
        grid.appendChild(msg);
      }
    }

    function showStep(step){
      stepPick.hidden = step !== 'pick';
      stepDetails.hidden = step !== 'details';
      stepDone.hidden = step !== 'done';
    }

    function goToDetails(){
      pickedNote2.innerHTML = 'Booking: <strong>' + picked.label + ' at ' + picked.time + ' Eastern</strong>';
      showStep('details');
    }

    function openModal(){
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      picked = null;
      form.reset();
      formError.hidden = true;
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
      showStep('pick');
      renderGrid();
    }
    function closeModal(){
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Delegated, not bound per-element — pricing tiers can be replaced by
    // fetched content after this runs, and their "Schedule a call" button
    // still needs to open this modal.
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-schedule]');
      if (!btn) return;
      e.preventDefault();
      openModal();
    });
    closeBtn.addEventListener('click', closeModal);
    doneClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });
    backBtn.addEventListener('click', function () { showStep('pick'); });

    prevBtn.addEventListener('click', function () {
      weekStart.setDate(weekStart.getDate() - 7);
      if (weekStart.getTime() < thisMonday.getTime()) weekStart = new Date(thisMonday);
      renderGrid();
    });
    nextBtn.addEventListener('click', function () {
      weekStart.setDate(weekStart.getDate() + 7);
      renderGrid();
    });

    var formError = document.getElementById('schedFormError');
    var submitBtn = form.querySelector('button[type=submit]');
    var submitLabel = submitBtn.textContent;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!picked) return;

      var name = document.getElementById('schedName').value.trim();
      var phone = document.getElementById('schedPhone').value.trim();
      var biz = document.getElementById('schedBiz').value.trim();
      var pkg = document.getElementById('schedPackage').value;
      var honeypot = document.getElementById('schedWebsite').value;
      var requestedTime = picked.label + ' at ' + picked.time + ' Eastern';

      formError.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending\u2026';

      fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name, phone: phone, business: biz,
          package: pkg, requestedTime: requestedTime, website: honeypot
        })
      })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          return { httpOk: r.ok, data: data };
        });
      })
      .then(function (res) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
        if (!res.httpOk || !res.data || res.data.ok !== true) {
          formError.hidden = false;
          return;
        }
        doneSummary.innerHTML = name + ' &middot; ' + biz + '<br>' + requestedTime + ' &middot; ' + pkg;
        showStep('done');
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
        formError.hidden = false;
      });
    });
  })();

  /* ---- mobile menu ---- */
  var menuBtn = document.getElementById('menu'), navEl = document.getElementById('nav');
  menuBtn.addEventListener('click', function(){
    var open = navEl.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  navEl.addEventListener('click', function(e){
    if (e.target.tagName === 'A'){
      navEl.classList.remove('open');
      menuBtn.setAttribute('aria-expanded','false');
      menuBtn.setAttribute('aria-label','Open menu');
    }
  });

  /* ---- form ---- */
  var form = document.getElementById('enquiry');
  if (form) {
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      if (!form.checkValidity()){ form.reportValidity(); return; }
      var sentNote = document.getElementById('sent');
      var errorNote = document.getElementById('enquiryError');
      var btn = form.querySelector('button[type=submit]');
      var originalLabel = btn.textContent;
      errorNote.classList.remove('show');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      var data = new FormData(form);
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          business: data.get('business'),
          email: data.get('email'),
          need: data.get('need'),
          message: data.get('message'),
          website: data.get('website'),
        }),
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (json) {
          if (!r.ok || json.ok === false) throw new Error();
          sentNote.classList.add('show');
          btn.textContent = 'Sent';
        });
      }).catch(function () {
        errorNote.classList.add('show');
        btn.disabled = false;
        btn.textContent = originalLabel;
      });
    });
  }
})();

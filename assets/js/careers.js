(function () {
  'use strict';

  var SUPABASE_URL = 'https://vzaynbedwvsvkczoduts.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_pelVhIVuZ2CnHZWGqplC1A_Dvg5H4zY';

  var modal = document.getElementById('applyModal');
  var form = document.getElementById('applyForm');
  var positionEl = document.getElementById('modalPosition');
  var successEl = document.getElementById('applySuccess');
  var errorEl = document.getElementById('applyError');
  var pageLoadTime = Date.now();

  window.openApply = function (position) {
    if (positionEl) positionEl.textContent = position;
    if (form) { form.style.display = 'block'; form.reset(); }
    if (successEl) successEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (modal) modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeApply = function () {
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeApply();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.style.display === 'flex') closeApply();
    });
  }

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    form.querySelectorAll('.form-error').forEach(function (el) {
      el.classList.remove('visible');
    });
    if (errorEl) errorEl.style.display = 'none';

    var position = positionEl ? positionEl.textContent : '';
    var name = form.querySelector('[name="full_name"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim();
    var phone = form.querySelector('[name="phone"]').value.trim();
    var linkedin = form.querySelector('[name="linkedin_url"]').value.trim();
    var notes = form.querySelector('[name="notes"]').value.trim();
    var resumeFile = form.querySelector('[name="resume"]').files[0];

    var valid = true;
    if (!name) { showError('full_name', 'Required'); valid = false; }
    if (!email) {
      showError('email', 'Required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Enter a valid email');
      valid = false;
    }
    if (!resumeFile) { showError('resume', 'Resume is required'); valid = false; }

    if (Date.now() - pageLoadTime < 2000) valid = false;

    if (!valid) return;

    var btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Submitting...';
    }

    try {
      var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      var resumeUrl = null;
      if (resumeFile) {
        var ext = resumeFile.name.split('.').pop();
        var filePath = Date.now() + '_' + Math.random().toString(36).substring(2, 10) + '.' + ext;
        var uploadResult = await client.storage.from('resumes').upload(filePath, resumeFile, {
          cacheControl: '3600',
          upsert: false
        });
        if (uploadResult.error) throw uploadResult.error;
        var publicResult = client.storage.from('resumes').getPublicUrl(filePath);
        resumeUrl = publicResult.data.publicUrl;
      }

      var result = await client.from('career_applications').insert([{
        position: position,
        full_name: name,
        email: email,
        phone: phone || null,
        linkedin_url: linkedin || null,
        notes: notes || null,
        resume_url: resumeUrl
      }]);

      if (result.error) throw result.error;

      form.style.display = 'none';
      if (successEl) successEl.style.display = 'block';
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = 'Submission failed. Please try again or email us directly.';
        errorEl.style.display = 'block';
      }
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Submit Application';
      }
    }
  });

  function showError(name, msg) {
    var field = form.querySelector('[name="' + name + '"]');
    if (!field) return;
    var errorEl_ = field.parentElement.querySelector('.form-error');
    if (errorEl_) {
      errorEl_.textContent = msg;
      errorEl_.classList.add('visible');
    }
  }
})();

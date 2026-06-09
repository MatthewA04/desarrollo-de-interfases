import { Directive, ElementRef, Input, OnInit, HostListener, Renderer2 } from '@angular/core';
import { Cita } from '../../core/models/cita.model';

// =============================================================
// DIRECTIVA PERSONALIZADA: ResaltarProximaCitaDirective
// Las directivas modifican el comportamiento o apariencia
// de un elemento HTML. Esta aplica estilos especiales a las
// citas que son en las próximas 24 horas.
//
// Uso en HTML: <div [appResaltarProxima]="cita"> ... </div>
// =============================================================

@Directive({
  selector: '[appResaltarProxima]',
  standalone: true
})
export class ResaltarProximaCitaDirective implements OnInit {

  // @Input recibe datos desde el componente padre
  @Input('appResaltarProxima') cita!: Cita;

  constructor(
    private el: ElementRef,    // referencia al elemento HTML
    private renderer: Renderer2 // forma segura de manipular el DOM
  ) {}

  ngOnInit(): void {
    this.aplicarEstilo();
  }

  private aplicarEstilo(): void {
    if (!this.cita) return;

    if (this.cita.esProxima()) {
      // Agrega un borde izquierdo naranja y animación de pulso
      this.renderer.setStyle(this.el.nativeElement, 'border-left', '4px solid #fd7e14');
      this.renderer.setStyle(this.el.nativeElement, 'animation', 'pulse-border 2s infinite');
      this.renderer.addClass(this.el.nativeElement, 'proxima-cita-highlight');
    }

    if (this.cita.estaPasada()) {
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.7');
    }
  }

  // @HostListener escucha eventos del elemento HTML
  // Cuando el mouse entra, muestra tooltip de "¡Próxima!"
  @HostListener('mouseenter') onMouseEnter() {
    if (this.cita?.esProxima()) {
      this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 0 12px rgba(253, 126, 20, 0.5)');
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.removeStyle(this.el.nativeElement, 'box-shadow');
  }
}

// =============================================================
// DIRECTIVA PERSONALIZADA: SoloNumerosDirective
// Evita que el usuario escriba letras en campos numéricos.
// Uso en HTML: <input type="text" appSoloNumeros>
// =============================================================

@Directive({
  selector: '[appSoloNumeros]',
  standalone: true
})
export class SoloNumerosDirective {

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.which ?? event.keyCode;
    // Permite: dígitos, punto decimal y tecla backspace
    if (charCode === 46) return true; // punto
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const texto = event.clipboardData?.getData('text') ?? '';
    if (!/^\d*\.?\d*$/.test(texto)) {
      event.preventDefault();
    }
  }
}

// =============================================================
// DIRECTIVA PERSONALIZADA: EstadoSaludColorDirective
// Cambia el color de fondo del elemento según el estado de salud
// Uso: <span [appEstadoSaludColor]="mascota.estadoSalud"> ... </span>
// =============================================================

@Directive({
  selector: '[appEstadoSaludColor]',
  standalone: true
})
export class EstadoSaludColorDirective implements OnInit {

  @Input('appEstadoSaludColor') estadoSalud!: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const colores: Record<string, { bg: string; text: string }> = {
      'Saludable':      { bg: '#d1e7dd', text: '#0f5132' },
      'En tratamiento': { bg: '#fff3cd', text: '#664d03' },
      'Crítico':        { bg: '#f8d7da', text: '#842029' },
      'En observación': { bg: '#cff4fc', text: '#055160' }
    };

    const color = colores[this.estadoSalud];
    if (color) {
      this.renderer.setStyle(this.el.nativeElement, 'background-color', color.bg);
      this.renderer.setStyle(this.el.nativeElement, 'color', color.text);
      this.renderer.setStyle(this.el.nativeElement, 'padding', '2px 8px');
      this.renderer.setStyle(this.el.nativeElement, 'border-radius', '4px');
      this.renderer.setStyle(this.el.nativeElement, 'font-weight', '600');
    }
  }
}
